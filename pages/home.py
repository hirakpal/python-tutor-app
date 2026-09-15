from __future__ import annotations

import streamlit as st

from modules.chapters import DIFFICULTY_COLORS
from utils.analytics import completion_stats, module_snapshots
from utils.session import navigate_to_analytics, navigate_to_lesson, navigate_to_module


def _difficulty_rank(value: str) -> int:
    return {"Beginner": 0, "Average": 1, "Expert": 2, "God": 3}.get(value, 0)


def _sort_modules(modules: list[dict], mode: str) -> list[dict]:
    if mode == "Recently Accessed":
        return sorted(modules, key=lambda item: item["last_accessed_at"] or "", reverse=True)
    if mode == "Difficulty":
        return sorted(modules, key=lambda item: _difficulty_rank(item["last_difficulty"]), reverse=True)
    return sorted(modules, key=lambda item: (item["progress_percent"], item["last_accessed_at"] or ""), reverse=True)


def _status_class(status: str) -> str:
    return {
        "Not Started": "status-not-started",
        "In Progress": "status-in-progress",
        "Completed": "status-completed",
    }[status]


def render_home_page(profile: dict, modules: list[dict]) -> None:
    snapshots = module_snapshots(profile, modules)
    stats = completion_stats(profile, modules)

    st.markdown("### Home")
    metric_columns = st.columns(5)
    metric_columns[0].metric("Total modules", stats["total_modules"])
    metric_columns[1].metric("Completed modules", stats["completed_modules"])
    metric_columns[2].metric("Learning time", f"{stats['total_learning_minutes']} min")
    metric_columns[3].metric("Current streak", f"{stats['current_streak']} day(s)")
    metric_columns[4].metric("Overall progress", f"{stats['overall_progress']}%")

    current_module_id = profile.get("last_module_id")
    current_lesson_id = profile.get("last_lesson_id")
    current_module = next((module for module in snapshots if module["id"] == current_module_id and module["continue_learning"]), None)
    if current_module and current_lesson_id:
        st.info(f"Continue learning in **{current_module['title']}** where you left off.")
        first, second = st.columns([1, 5])
        with first:
            if st.button("▶️ Continue Learning", key="continue_learning"):
                navigate_to_lesson(current_module_id, current_lesson_id)
                st.rerun()
        with second:
            if st.button("📊 View analytics", key="continue_analytics"):
                navigate_to_analytics()
                st.rerun()

    filter_col, sort_col = st.columns(2)
    selected_filter = filter_col.selectbox("Filter by status", ["All", "Not Started", "In Progress", "Completed"])
    selected_sort = sort_col.selectbox("Sort by", ["Progress", "Recently Accessed", "Difficulty"])

    filtered = snapshots
    if selected_filter != "All":
        filtered = [item for item in snapshots if item["status"] == selected_filter]
    filtered = _sort_modules(filtered, selected_sort)

    if not filtered:
        st.warning("No modules match the selected filter.")
        return

    for chunk_start in range(0, len(filtered), 3):
        columns = st.columns(3)
        for column, module in zip(columns, filtered[chunk_start: chunk_start + 3]):
            highlight = " highlight" if module["id"] == profile.get("last_module_id") else ""
            difficulty_color = DIFFICULTY_COLORS.get(module["last_difficulty"], "#64748b")
            with column:
                st.markdown(
                    f"""
                    <div class='module-card{highlight}'>
                        <div class='module-title'>{module['emoji']} Chapter {module['number']}: {module['title']}</div>
                        <div class='module-meta'>{module['description']}</div>
                        <span class='status-badge {_status_class(module['status'])}'>{module['status']}</span><br />
                        <span class='difficulty-chip' style='background:{difficulty_color};'>Last difficulty: {module['last_difficulty']}</span>
                        <div class='module-meta'>Lessons: {module['lesson_count']} • Est. time: {module['estimated_minutes']} min</div>
                        <div class='module-meta'>Progress: {module['progress_percent']}% • Completed lessons: {module['completed_lessons']}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
                st.progress(module["progress_percent"] / 100)
                if st.button("Open module", key=f"open_{module['id']}", use_container_width=True):
                    navigate_to_module(module["id"])
                    st.rerun()
