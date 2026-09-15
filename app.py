from __future__ import annotations

import json
from datetime import datetime

import streamlit as st

from lessons.content import DIFFICULTY_LEVELS, LESSONS
from utils.progress import (
    complete_lesson,
    export_progress_report,
    get_completion_percentage,
    get_lesson_status,
    get_user_progress,
    touch_user_session,
)


st.set_page_config(page_title="Python Tutor App", page_icon="🐍", layout="wide")


def get_current_username() -> str:
    username = st.session_state.get("username", "").strip()
    return username or "guest"


def render_level_indicator(current_level: str) -> None:
    labels = []
    for level in DIFFICULTY_LEVELS:
        if level == current_level:
            labels.append(f"**🟢 {level}**")
        else:
            labels.append(level)
    st.caption("Difficulty: " + " → ".join(labels))


def render_sidebar() -> tuple[str, str]:
    with st.sidebar:
        st.title("🐍 Python Tutor")
        username = st.text_input(
            "Profile name",
            value=st.session_state.get("username", "guest"),
            help="Use any name to save and resume your lesson progress.",
        ).strip() or "guest"
        st.session_state["username"] = username

        difficulty = st.radio(
            "Choose your coding level",
            DIFFICULTY_LEVELS,
            index=DIFFICULTY_LEVELS.index(st.session_state.get("difficulty", "Beginner")),
        )
        st.session_state["difficulty"] = difficulty

        search = st.text_input("Search lessons", placeholder="Try: functions, loops, strings")
        st.divider()
    return username, search


def render_stats(username: str, progress: dict) -> None:
    total_lessons = len(LESSONS)
    completed_lessons = len(progress["completed_lessons"])
    completion = get_completion_percentage(progress, total_lessons)
    time_spent_minutes = int(progress["time_spent_seconds"] // 60)

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Profile", username)
    col2.metric("Total lessons", total_lessons)
    col3.metric("Completed", completed_lessons)
    col4.metric("Time spent", f"{time_spent_minutes} min")
    st.progress(completion / 100, text=f"Course completion: {completion}%")


def render_lesson_list(search: str, progress: dict) -> int:
    st.subheader("Lessons")
    search_term = search.lower().strip()

    filtered_lessons = [
        lesson
        for lesson in LESSONS
        if not search_term
        or search_term in lesson["title"].lower()
        or search_term in lesson["topic"].lower()
        or search_term in lesson["description"].lower()
    ]

    if not filtered_lessons:
        st.info("No lessons match your search.")
        return 0

    unlocked_count = max(1, len(progress["completed_lessons"]) + 1)
    for index, lesson in enumerate(filtered_lessons):
        original_index = LESSONS.index(lesson)
        is_unlocked = original_index < unlocked_count
        is_completed = lesson["id"] in progress["completed_lessons"]
        status = "✅ Completed" if is_completed else "🔓 Unlocked" if is_unlocked else "🔒 Locked"
        with st.expander(f"{lesson['title']} — {status}", expanded=original_index == 0):
            st.write(f"**Topic:** {lesson['topic']}")
            st.write(lesson["description"])
            st.write("**Learning objectives**")
            for objective in lesson["objectives"]:
                st.write(f"- {objective}")
            if not is_unlocked:
                st.caption("Complete earlier lessons to unlock this lesson.")
            if st.button(
                "Open lesson",
                key=f"open-{lesson['id']}",
                disabled=not is_unlocked,
                use_container_width=True,
            ):
                st.session_state["selected_lesson_id"] = lesson["id"]
    return unlocked_count


def render_selected_lesson(progress: dict) -> None:
    selected_id = st.session_state.get("selected_lesson_id", LESSONS[0]["id"])
    lesson = next((item for item in LESSONS if item["id"] == selected_id), LESSONS[0])
    difficulty = st.session_state.get("difficulty", "Beginner")
    lesson_content = lesson["levels"][difficulty]

    st.subheader(lesson["title"])
    st.write(lesson["description"])
    render_level_indicator(difficulty)

    st.write("**Code example**")
    st.code(lesson_content["code"], language="python")

    st.write("**Explanation**")
    st.write(lesson_content["explanation"])

    col1, col2 = st.columns([1, 1])
    with col1:
        if st.button(
            "Mark lesson complete",
            key=f"complete-{lesson['id']}",
            disabled=lesson["id"] in progress["completed_lessons"],
            use_container_width=True,
        ):
            username = get_current_username()
            complete_lesson(username, lesson["id"])
            st.success(f"Saved progress for {lesson['title']}.")
            st.rerun()
    with col2:
        status = get_lesson_status(progress, lesson["id"], LESSONS.index(lesson))
        st.info(status)


def render_export(username: str, progress: dict) -> None:
    report = export_progress_report(username, progress, LESSONS)
    st.download_button(
        "Export progress report",
        data=json.dumps(report, indent=2),
        file_name=f"{username.lower().replace(' ', '_')}_python_tutor_progress.json",
        mime="application/json",
        use_container_width=True,
    )
    st.caption(f"Last saved: {progress['last_active']}")


def main() -> None:
    username, search = render_sidebar()
    touch_user_session(username)
    progress = get_user_progress(username)

    st.title("Learn Python at Your Pace")
    st.write(
        "Study one lesson at a time, switch code difficulty instantly, and keep your progress saved."
    )
    render_stats(username, progress)

    left_col, right_col = st.columns([1, 1.2], gap="large")
    with left_col:
        render_lesson_list(search, progress)
    with right_col:
        render_selected_lesson(progress)
        st.divider()
        render_export(username, progress)
        st.caption(f"Session updated at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
