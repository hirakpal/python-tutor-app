from __future__ import annotations

import streamlit as st

from modules.module_manager import module_by_id
from utils.progress import record_module_visit
from utils.session import navigate_to_home, navigate_to_lesson


def render_module_detail_page(profile: dict, modules: list[dict]) -> None:
    module = module_by_id(modules, st.session_state.selected_module_id)
    if not module:
        navigate_to_home()
        st.rerun()

    record_module_visit(profile, module, st.session_state.current_difficulty)
    state = profile["modules"][module["id"]]
    st.markdown(f"<div class='breadcrumb'>Home &gt; Chapter {module['number']}: {module['title']}</div>", unsafe_allow_html=True)
    st.title(f"{module['emoji']} {module['title']}")
    st.write(module["overview"])
    st.progress(state["progress_percent"] / 100)
    st.caption(
        f"Status: {state['status']} • {len(state['completed_lessons'])}/{module['lesson_count']} lessons completed • Estimated time: {module['estimated_minutes']} min"
    )
    st.link_button("Official tutorial chapter", module["docs_link"])

    st.subheader("Lessons")
    for lesson in module["lessons"]:
        completed = lesson["id"] in state["completed_lessons"]
        current = lesson["id"] == state["current_lesson_id"]
        prefix = "✅" if completed else ("➡️" if current else "📘")
        css_class = "lesson-row current" if current else "lesson-row"
        st.markdown(
            f"""
            <div class='{css_class}'>
                <strong>{prefix} Lesson {lesson['number']}: {lesson['title']}</strong><br />
                {lesson['summary']}<br />
                <small>Estimated time: {lesson['estimated_minutes']} min • Docs: {lesson['docs_link']}</small>
            </div>
            """,
            unsafe_allow_html=True,
        )
        action_label = "Continue lesson" if current else ("Review lesson" if completed else "Start lesson")
        if st.button(action_label, key=f"lesson_{lesson['id']}", use_container_width=True):
            navigate_to_lesson(module["id"], lesson["id"])
            st.rerun()
