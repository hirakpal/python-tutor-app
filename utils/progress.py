from __future__ import annotations

import json
import os
import re
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DATA_ROOT = Path(os.getenv("PYTHON_TUTOR_DATA_DIR", Path(__file__).resolve().parents[1] / "data"))
PROFILE_DIR = DATA_ROOT / "user_profiles"
PROGRESS_FILE = DATA_ROOT / "user_progress.json"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_data_dirs() -> None:
    DATA_ROOT.mkdir(parents=True, exist_ok=True)
    PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_ROOT / "modules").mkdir(parents=True, exist_ok=True)
    (DATA_ROOT / "embeddings").mkdir(parents=True, exist_ok=True)


def safe_profile_name(username: str) -> str:
    cleaned = re.sub(r"[^a-z0-9_-]+", "_", username.strip().lower())
    cleaned = cleaned.strip("._-")
    return cleaned or "guest"


def profile_path(username: str) -> Path:
    ensure_data_dirs()
    return PROFILE_DIR / f"{safe_profile_name(username)}.json"


def available_profiles() -> list[str]:
    ensure_data_dirs()
    names = []
    for path in sorted(PROFILE_DIR.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        names.append(data.get("username", path.stem))
    return names or ["Guest"]


def _module_state(module: dict) -> dict[str, Any]:
    return {
        "completed_lessons": [],
        "current_lesson_id": module["lessons"][0]["id"] if module["lessons"] else None,
        "status": "Not Started",
        "progress_percent": 0,
        "last_accessed_at": None,
        "last_difficulty": "Beginner",
        "time_spent_seconds": 0,
        "completion_times": {},
    }


def _base_profile(username: str, modules: list[dict]) -> dict[str, Any]:
    now = utc_now()
    return {
        "username": username,
        "created_at": now,
        "updated_at": now,
        "last_accessed_at": now,
        "last_module_id": None,
        "last_lesson_id": None,
        "last_difficulty": "Beginner",
        "difficulty_usage": {"Beginner": 0, "Average": 0, "Expert": 0, "God": 0},
        "daily_activity": {},
        "session_history": [],
        "modules": {module["id"]: _module_state(module) for module in modules},
    }


def _normalize_profile(profile: dict[str, Any], modules: list[dict]) -> dict[str, Any]:
    merged = _base_profile(profile.get("username", "Guest"), modules)
    merged.update({key: value for key, value in profile.items() if key != "modules"})
    module_state = profile.get("modules", {})
    for module in modules:
        merged["modules"][module["id"]].update(module_state.get(module["id"], {}))
        _refresh_module_progress(merged, module)
    return merged


def create_or_load_profile(username: str, modules: list[dict]) -> dict[str, Any]:
    path = profile_path(username)
    if path.exists():
        profile = json.loads(path.read_text(encoding="utf-8"))
        return _normalize_profile(profile, modules)
    profile = _base_profile(username, modules)
    save_profile(profile)
    return profile


def save_profile(profile: dict[str, Any]) -> None:
    ensure_data_dirs()
    profile["updated_at"] = utc_now()
    profile_path(profile["username"]).write_text(json.dumps(profile, indent=2), encoding="utf-8")


def update_profile_difficulty(profile: dict[str, Any], difficulty: str) -> None:
    profile["last_difficulty"] = difficulty
    profile["last_accessed_at"] = utc_now()
    save_profile(profile)


def _session_event(kind: str, module_id: str | None, lesson_id: str | None, difficulty: str) -> dict[str, Any]:
    return {
        "event": kind,
        "module_id": module_id,
        "lesson_id": lesson_id,
        "difficulty": difficulty,
        "timestamp": utc_now(),
    }


def _refresh_module_progress(profile: dict[str, Any], module: dict) -> dict[str, Any]:
    state = profile["modules"][module["id"]]
    total = max(len(module["lessons"]), 1)
    completed = len(state["completed_lessons"])
    progress_percent = int(round((completed / total) * 100))
    state["progress_percent"] = progress_percent
    if completed == 0:
        state["status"] = "Not Started"
    elif completed >= total:
        state["status"] = "Completed"
    else:
        state["status"] = "In Progress"
    if not state["current_lesson_id"] and module["lessons"]:
        state["current_lesson_id"] = module["lessons"][0]["id"]
    return state


def record_module_visit(profile: dict[str, Any], module: dict, difficulty: str) -> None:
    state = profile["modules"][module["id"]]
    timestamp = utc_now()
    state["last_accessed_at"] = timestamp
    state["last_difficulty"] = difficulty
    profile["last_module_id"] = module["id"]
    profile["last_lesson_id"] = state["current_lesson_id"]
    profile["last_accessed_at"] = timestamp
    profile["last_difficulty"] = difficulty
    profile["session_history"].append(_session_event("module_visit", module["id"], state["current_lesson_id"], difficulty))
    profile["session_history"] = profile["session_history"][-200:]
    _refresh_module_progress(profile, module)
    save_profile(profile)


def record_lesson_view(profile: dict[str, Any], module: dict, lesson_id: str, difficulty: str) -> None:
    state = profile["modules"][module["id"]]
    timestamp = utc_now()
    state["current_lesson_id"] = lesson_id
    state["last_accessed_at"] = timestamp
    state["last_difficulty"] = difficulty
    profile["last_module_id"] = module["id"]
    profile["last_lesson_id"] = lesson_id
    profile["last_accessed_at"] = timestamp
    profile["last_difficulty"] = difficulty
    profile["difficulty_usage"][difficulty] = profile["difficulty_usage"].get(difficulty, 0) + 1
    profile["session_history"].append(_session_event("lesson_view", module["id"], lesson_id, difficulty))
    profile["session_history"] = profile["session_history"][-200:]
    _refresh_module_progress(profile, module)
    save_profile(profile)


def mark_lesson_complete(
    profile: dict[str, Any],
    module: dict,
    lesson: dict,
    difficulty: str,
    elapsed_seconds: int,
) -> tuple[bool, bool]:
    state = profile["modules"][module["id"]]
    completed_before = lesson["id"] in state["completed_lessons"]
    if not completed_before:
        state["completed_lessons"].append(lesson["id"])
        state["completed_lessons"].sort(key=lambda lesson_id: next(item["number"] for item in module["lessons"] if item["id"] == lesson_id))
        state["completion_times"][lesson["id"]] = utc_now()

    timestamp = _record_lesson_time(profile, module, lesson["id"], elapsed_seconds, difficulty)
    profile["difficulty_usage"][difficulty] = profile["difficulty_usage"].get(difficulty, 0) + 1
    day_key = timestamp[:10]
    day_state = profile["daily_activity"].setdefault(day_key, {"lessons_completed": 0, "seconds": 0})
    if not completed_before:
        day_state["lessons_completed"] += 1

    profile["session_history"].append(_session_event("lesson_complete", module["id"], lesson["id"], difficulty))
    profile["session_history"] = profile["session_history"][-200:]

    lesson_ids = [item["id"] for item in module["lessons"]]
    try:
        current_index = lesson_ids.index(lesson["id"])
    except ValueError:
        current_index = 0
    if current_index < len(lesson_ids) - 1:
        state["current_lesson_id"] = lesson_ids[current_index + 1]
    profile["last_lesson_id"] = state["current_lesson_id"]

    refreshed = _refresh_module_progress(profile, module)
    module_completed = refreshed["status"] == "Completed"
    save_profile(profile)
    return (not completed_before), module_completed


def _record_lesson_time(
    profile: dict[str, Any],
    module: dict,
    lesson_id: str,
    elapsed_seconds: int,
    difficulty: str | None = None,
) -> str:
    timestamp = utc_now()
    elapsed = max(elapsed_seconds, 0)
    state = profile["modules"][module["id"]]
    state["time_spent_seconds"] += elapsed
    state["current_lesson_id"] = lesson_id
    state["last_accessed_at"] = timestamp
    if difficulty is not None:
        state["last_difficulty"] = difficulty
        profile["last_difficulty"] = difficulty
    profile["last_module_id"] = module["id"]
    profile["last_lesson_id"] = lesson_id
    profile["last_accessed_at"] = timestamp
    day_key = timestamp[:10]
    day_state = profile["daily_activity"].setdefault(day_key, {"lessons_completed": 0, "seconds": 0})
    day_state["seconds"] += elapsed
    return timestamp


def record_lesson_time(profile: dict[str, Any], module: dict, lesson_id: str, elapsed_seconds: int) -> None:
    if elapsed_seconds <= 0:
        return
    _record_lesson_time(profile, module, lesson_id, elapsed_seconds)
    save_profile(profile)


def reset_profile(profile: dict[str, Any], modules: list[dict]) -> dict[str, Any]:
    fresh = _base_profile(profile["username"], modules)
    path = profile_path(profile["username"])
    path.write_text(json.dumps(fresh, indent=2), encoding="utf-8")
    profile.clear()
    profile.update(fresh)
    return profile


def restore_profile_backup(payload: bytes, modules: list[dict]) -> dict[str, Any]:
    try:
        restored = json.loads(payload.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError("Invalid backup file.") from exc
    if not isinstance(restored, dict) or not isinstance(restored.get("username"), str):
        raise ValueError("Invalid backup file.")
    if "modules" in restored and not isinstance(restored["modules"], dict):
        raise ValueError("Invalid backup file.")
    normalized = _normalize_profile(restored, modules)
    save_profile(normalized)
    return normalized


def export_profile_json(profile: dict[str, Any]) -> bytes:
    return json.dumps(profile, indent=2).encode("utf-8")


def export_profile_pdf(profile: dict[str, Any], modules: list[dict]) -> bytes:
    lines = [
        "Python Tutor App Progress Report",
        f"Learner: {profile['username']}",
        f"Last difficulty: {profile['last_difficulty']}",
        "",
    ]
    for module in modules:
        state = profile["modules"][module["id"]]
        lines.append(
            f"{module['number']}. {module['title']} - {state['status']} - {state['progress_percent']}% - {round(state['time_spent_seconds'] / 60, 1)} minutes"
        )

    def pdf_escape(text: str) -> str:
        return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

    y_position = 780
    commands = ["BT", "/F1 12 Tf"]
    for line in lines:
        commands.append(f"1 0 0 1 50 {y_position} Tm ({pdf_escape(line)}) Tj")
        y_position -= 16
    commands.append("ET")
    content = "\n".join(commands).encode("latin-1", errors="ignore")

    objects = []
    objects.append(b"1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n")
    objects.append(b"2 0 obj<< /Type /Pages /Count 1 /Kids [3 0 R] >>endobj\n")
    objects.append(b"3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n")
    objects.append(f"4 0 obj<< /Length {len(content)} >>stream\n".encode("latin-1") + content + b"\nendstream endobj\n")
    objects.append(b"5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n")

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(obj)
    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(f"trailer<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF".encode("latin-1"))
    return bytes(pdf)

def _ensure_storage() -> None:
    ensure_data_dirs()
    if not PROGRESS_FILE.exists():
        PROGRESS_FILE.write_text("{}", encoding="utf-8")


def _read_all_progress() -> dict[str, Any]:
    _ensure_storage()
    return json.loads(PROGRESS_FILE.read_text(encoding="utf-8") or "{}")


def _write_all_progress(progress_data: dict[str, Any]) -> None:
    _ensure_storage()
    PROGRESS_FILE.write_text(json.dumps(progress_data, indent=2), encoding="utf-8")


def _default_progress() -> dict[str, Any]:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return {
        "completed_lessons": [],
        "time_spent_seconds": 0,
        "last_active": now,
        "last_seen_at": now,
        "learned_topics": [],
        "generated_lessons": [],
    }


def _normalize_progress(progress: dict[str, Any]) -> dict[str, Any]:
    defaults = _default_progress()
    normalized = {**defaults, **progress}
    if not isinstance(normalized.get("learned_topics"), list):
        normalized["learned_topics"] = []
    if not isinstance(normalized.get("generated_lessons"), list):
        normalized["generated_lessons"] = []
    if not isinstance(normalized.get("completed_lessons"), list):
        normalized["completed_lessons"] = []
    return normalized


def get_user_progress(username: str) -> dict[str, Any]:
    progress_data = _read_all_progress()
    if username not in progress_data:
        progress_data[username] = _default_progress()
    progress_data[username] = _normalize_progress(progress_data[username])
    _write_all_progress(progress_data)
    return progress_data[username]


def touch_user_session(username: str) -> None:
    progress_data = _read_all_progress()
    progress = _normalize_progress(progress_data.get(username, _default_progress()))
    now = datetime.now()
    try:
        last_seen = datetime.strptime(progress["last_seen_at"], "%Y-%m-%d %H:%M:%S")
    except (TypeError, ValueError):
        last_seen = now
    elapsed = max(0, min(int((now - last_seen).total_seconds()), 300))
    progress["time_spent_seconds"] += elapsed
    progress["last_active"] = now.strftime("%Y-%m-%d %H:%M:%S")
    progress["last_seen_at"] = progress["last_active"]
    progress_data[username] = progress
    _write_all_progress(progress_data)


def complete_lesson(username: str, lesson_id: str) -> None:
    progress_data = _read_all_progress()
    progress = _normalize_progress(progress_data.get(username, _default_progress()))
    if lesson_id not in progress["completed_lessons"]:
        progress["completed_lessons"].append(lesson_id)
    progress["last_active"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    progress_data[username] = progress
    _write_all_progress(progress_data)


def save_generated_lesson(username: str, lesson_payload: dict[str, Any]) -> None:
    progress_data = _read_all_progress()
    progress = _normalize_progress(progress_data.get(username, _default_progress()))
    progress["generated_lessons"] = [
        entry
        for entry in progress["generated_lessons"]
        if entry.get("topic", "").lower() != lesson_payload.get("topic", "").lower()
    ]
    progress["generated_lessons"].append(lesson_payload)
    progress["last_active"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    progress_data[username] = progress
    _write_all_progress(progress_data)


def mark_topic_learned(username: str, topic: str) -> None:
    progress_data = _read_all_progress()
    progress = _normalize_progress(progress_data.get(username, _default_progress()))
    normalized_topic = topic.strip().lower()
    existing_topics = [item.lower() for item in progress["learned_topics"] if isinstance(item, str)]
    if normalized_topic and normalized_topic not in existing_topics:
        progress["learned_topics"].append(topic.strip())
    progress["last_active"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    progress_data[username] = progress
    _write_all_progress(progress_data)


def get_completion_percentage(progress: dict[str, Any], total_lessons: int) -> int:
    if total_lessons == 0:
        return 0
    return round((len(progress["completed_lessons"]) / total_lessons) * 100)


def get_lesson_status(progress: dict[str, Any], lesson_id: str, lesson_index: int) -> str:
    unlocked_count = max(1, len(progress["completed_lessons"]) + 1)
    if lesson_id in progress["completed_lessons"]:
        return "Completed"
    if lesson_index < unlocked_count:
        return "Ready to learn"
    return "Locked until you complete the earlier lesson"


def export_progress_report(username: str, progress: dict[str, Any], lessons: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "username": username,
        "completed_lessons": progress["completed_lessons"],
        "completion_percentage": get_completion_percentage(progress, len(lessons)),
        "time_spent_minutes": int(progress["time_spent_seconds"] // 60),
        "remaining_lessons": [
            lesson["title"] for lesson in lessons if lesson["id"] not in progress["completed_lessons"]
        ],
        "learned_topics": progress.get("learned_topics", []),
        "generated_lesson_topics": [entry.get("topic") for entry in progress.get("generated_lessons", [])],
        "last_active": progress["last_active"],
    }
