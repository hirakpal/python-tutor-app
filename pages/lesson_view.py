from __future__ import annotations

from datetime import datetime, timezone

import streamlit as st

from modules.module_manager import lesson_by_id, module_by_id, neighboring_lessons
from utils.progress import mark_lesson_complete, record_lesson_time, record_lesson_view, update_profile_difficulty
from utils.session import navigate_to_home, navigate_to_lesson, navigate_to_module


def _elapsed_seconds() -> int:
    started_at = st.session_state.lesson_started_at
    if not started_at:
        return 0
    start = datetime.fromisoformat(started_at)
    return max(int((datetime.now(timezone.utc) - start).total_seconds()), 0)


def render_lesson_view(profile: dict, modules: list[dict]) -> None:
    module = module_by_id(modules, st.session_state.selected_module_id)
    if not module:
        navigate_to_home()
        st.rerun()
    lesson = lesson_by_id(module, st.session_state.selected_lesson_id)
    if not lesson:
        navigate_to_module(module["id"])
        st.rerun()

    if st.session_state.lesson_started_at is None:
        st.session_state.lesson_started_at = datetime.now(timezone.utc).isoformat()
        record_lesson_view(profile, module, lesson["id"], st.session_state.current_difficulty)

    state = profile["modules"][module["id"]]
    difficulty = st.radio("Lesson difficulty", options=list(lesson["difficulty_content"].keys()), horizontal=True, index=list(lesson["difficulty_content"].keys()).index(st.session_state.current_difficulty))
    if difficulty != st.session_state.current_difficulty:
        st.session_state.current_difficulty = difficulty
        update_profile_difficulty(profile, difficulty)
        st.rerun()

    detail = lesson["difficulty_content"][difficulty]
    elapsed_seconds = _elapsed_seconds()
    previous_lesson, next_lesson = neighboring_lessons(module, lesson["id"])

    st.markdown(
        f"<div class='breadcrumb'>Home &gt; Chapter {module['number']}: {module['title']} &gt; Lesson {lesson['number']}: {lesson['title']}</div>",
        unsafe_allow_html=True,
    )
    st.title(f"Lesson {lesson['number']}: {lesson['title']}")
    st.caption(f"Estimated time: {lesson['estimated_minutes']} min • Time spent this visit: {round(elapsed_seconds / 60, 1)} min")
    st.progress(state["progress_percent"] / 100)

    st.subheader("Learning objectives")
    for objective in lesson["objectives"]:
        st.write(f"- {objective}")

    st.subheader("Explanation")
    st.write(detail["explanation"])

    st.subheader("Code example")
    st.code(detail["code"], language="python")
    st.link_button("Official documentation reference", lesson["docs_link"])

    st.subheader("Related topics")
    st.write(", ".join(lesson["related_topics"]))

    with st.expander("Quiz option"):
        st.write(lesson["quiz"]["question"])
        st.caption(f"Suggested answer: {lesson['quiz']['answer']}")

    action_columns = st.columns(4)
    if action_columns[0].button("⬅️ Back to module", use_container_width=True):
        record_lesson_time(profile, module, lesson["id"], elapsed_seconds)
        navigate_to_module(module["id"])
        st.rerun()
    if action_columns[1].button("✅ Mark as complete", use_container_width=True):
        first_completion, module_completed = mark_lesson_complete(profile, module, lesson, difficulty, elapsed_seconds)
        st.session_state.lesson_started_at = datetime.now(timezone.utc).isoformat()
        if first_completion:
            st.toast(f"Completed {lesson['title']}")
        if module_completed:
            st.toast(f"Module completed: {module['title']} 🎉")
        st.rerun()
    if action_columns[2].button("Previous lesson", use_container_width=True, disabled=previous_lesson is None):
        record_lesson_time(profile, module, lesson["id"], elapsed_seconds)
        navigate_to_lesson(module["id"], previous_lesson["id"])
        st.rerun()
    if action_columns[3].button("Next lesson", use_container_width=True, disabled=next_lesson is None):
        record_lesson_time(profile, module, lesson["id"], elapsed_seconds)
        navigate_to_lesson(module["id"], next_lesson["id"])
        st.rerun()
