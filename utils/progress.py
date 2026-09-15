from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PROGRESS_FILE = DATA_DIR / "user_progress.json"


def _ensure_storage() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not PROGRESS_FILE.exists():
        PROGRESS_FILE.write_text("{}", encoding="utf-8")


def _read_all_progress() -> dict:
    _ensure_storage()
    return json.loads(PROGRESS_FILE.read_text(encoding="utf-8") or "{}")


def _write_all_progress(progress_data: dict) -> None:
    _ensure_storage()
    PROGRESS_FILE.write_text(json.dumps(progress_data, indent=2), encoding="utf-8")


def _default_progress() -> dict:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return {
        "completed_lessons": [],
        "time_spent_seconds": 0,
        "last_active": now,
        "last_seen_at": now,
    }


def get_user_progress(username: str) -> dict:
    progress_data = _read_all_progress()
    if username not in progress_data:
        progress_data[username] = _default_progress()
        _write_all_progress(progress_data)
    return progress_data[username]


def touch_user_session(username: str) -> None:
    progress_data = _read_all_progress()
    progress = progress_data.get(username, _default_progress())
    now = datetime.now()
    last_seen = datetime.strptime(progress["last_seen_at"], "%Y-%m-%d %H:%M:%S")
    elapsed = max(0, min(int((now - last_seen).total_seconds()), 300))
    progress["time_spent_seconds"] += elapsed
    progress["last_active"] = now.strftime("%Y-%m-%d %H:%M:%S")
    progress["last_seen_at"] = progress["last_active"]
    progress_data[username] = progress
    _write_all_progress(progress_data)


def complete_lesson(username: str, lesson_id: str) -> None:
    progress_data = _read_all_progress()
    progress = progress_data.get(username, _default_progress())
    if lesson_id not in progress["completed_lessons"]:
        progress["completed_lessons"].append(lesson_id)
    progress["last_active"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    progress_data[username] = progress
    _write_all_progress(progress_data)


def get_completion_percentage(progress: dict, total_lessons: int) -> int:
    if total_lessons == 0:
        return 0
    return round((len(progress["completed_lessons"]) / total_lessons) * 100)


def get_lesson_status(progress: dict, lesson_id: str, lesson_index: int) -> str:
    unlocked_count = max(1, len(progress["completed_lessons"]) + 1)
    if lesson_id in progress["completed_lessons"]:
        return "Completed"
    if lesson_index < unlocked_count:
        return "Ready to learn"
    return "Locked until you complete the earlier lesson"


def export_progress_report(username: str, progress: dict, lessons: list[dict]) -> dict:
    return {
        "username": username,
        "completed_lessons": progress["completed_lessons"],
        "completion_percentage": get_completion_percentage(progress, len(lessons)),
        "time_spent_minutes": int(progress["time_spent_seconds"] // 60),
        "remaining_lessons": [
            lesson["title"] for lesson in lessons if lesson["id"] not in progress["completed_lessons"]
        ],
        "last_active": progress["last_active"],
    }
