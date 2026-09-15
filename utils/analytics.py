from __future__ import annotations

from datetime import datetime, timedelta, timezone


def module_snapshots(profile: dict, modules: list[dict]) -> list[dict]:
    snapshots = []
    for module in modules:
        state = profile["modules"][module["id"]]
        snapshots.append(
            {
                **module,
                "status": state["status"],
                "progress_percent": state["progress_percent"],
                "completed_lessons": len(state["completed_lessons"]),
                "time_spent_minutes": round(state["time_spent_seconds"] / 60, 1),
                "last_accessed_at": state["last_accessed_at"],
                "last_difficulty": state["last_difficulty"],
                "current_lesson_id": state["current_lesson_id"],
                "continue_learning": state["status"] == "In Progress",
            }
        )
    return snapshots


def overall_progress(profile: dict, modules: list[dict]) -> int:
    total_lessons = sum(len(module["lessons"]) for module in modules) or 1
    completed_lessons = sum(len(profile["modules"][module["id"]]["completed_lessons"]) for module in modules)
    return int(round((completed_lessons / total_lessons) * 100))


def completion_stats(profile: dict, modules: list[dict]) -> dict:
    snapshots = module_snapshots(profile, modules)
    completed_modules = sum(1 for item in snapshots if item["status"] == "Completed")
    total_seconds = sum(profile["modules"][module["id"]]["time_spent_seconds"] for module in modules)
    return {
        "total_modules": len(modules),
        "completed_modules": completed_modules,
        "total_learning_minutes": round(total_seconds / 60, 1),
        "overall_progress": overall_progress(profile, modules),
        "current_streak": current_streak(profile),
    }


def current_streak(profile: dict) -> int:
    activity_days = {datetime.fromisoformat(day).date() for day, stats in profile.get("daily_activity", {}).items() if stats.get("lessons_completed", 0) > 0}
    if not activity_days:
        return 0
    today = datetime.now(timezone.utc).date()
    if today not in activity_days and (today - timedelta(days=1)) not in activity_days:
        return 0
    streak = 0
    cursor = today if today in activity_days else today - timedelta(days=1)
    while cursor in activity_days:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def status_distribution(profile: dict, modules: list[dict]) -> list[dict]:
    counts = {"Not Started": 0, "In Progress": 0, "Completed": 0}
    for snapshot in module_snapshots(profile, modules):
        counts[snapshot["status"]] += 1
    return [{"status": key, "count": value} for key, value in counts.items()]


def learning_time_by_module(profile: dict, modules: list[dict]) -> list[dict]:
    return [
        {
            "module": module["title"],
            "minutes": round(profile["modules"][module["id"]]["time_spent_seconds"] / 60, 1),
        }
        for module in modules
    ]


def lessons_completed_by_day(profile: dict) -> list[dict]:
    rows = []
    for day, values in sorted(profile.get("daily_activity", {}).items()):
        rows.append({"day": day, "lessons": values.get("lessons_completed", 0)})
    return rows


def difficulty_distribution(profile: dict) -> list[dict]:
    return [{"difficulty": difficulty, "count": count} for difficulty, count in profile.get("difficulty_usage", {}).items()]


def achievement_badges(profile: dict, modules: list[dict]) -> list[str]:
    stats = completion_stats(profile, modules)
    badges = []
    if stats["overall_progress"] >= 25:
        badges.append("🥉 Quarter-way explorer")
    if stats["overall_progress"] >= 50:
        badges.append("🥈 Halfway hero")
    if stats["overall_progress"] >= 100:
        badges.append("🥇 Tutorial finisher")
    if stats["current_streak"] >= 3:
        badges.append("🔥 3-day streak")
    if any(count > 0 for difficulty, count in profile.get("difficulty_usage", {}).items() if difficulty == "God"):
        badges.append("🧠 God mode activated")
    return badges or ["🌱 Start a lesson to unlock achievements"]
