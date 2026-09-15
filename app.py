from __future__ import annotations

import streamlit as st

from modules.chapters import DIFFICULTIES, get_chapters
from pages.analytics import render_analytics_page
from pages.home import render_home_page
from pages.lesson_view import render_lesson_view
from pages.module_detail import render_module_detail_page
from styles.styling import apply_global_styles
from utils.progress import (
    available_profiles,
    create_or_load_profile,
    export_profile_json,
    reset_profile,
    restore_profile_backup,
    save_profile,
    update_profile_difficulty,
)
from utils.session import initialize_session, navigate_to_analytics, navigate_to_home


def render_profile_sidebar(profile: dict, modules: list[dict]) -> dict:
    st.sidebar.header("Profiles & sessions")
    profiles = available_profiles()
    if profile["username"] not in profiles:
        profiles = [profile["username"], *profiles]

    selected_profile = st.sidebar.selectbox(
        "Load profile",
        options=profiles,
        index=profiles.index(profile["username"]),
    )
    if selected_profile != st.session_state.active_profile:
        st.session_state.active_profile = selected_profile
        st.rerun()

    new_profile_name = st.sidebar.text_input("Create or open profile", placeholder="Learner name")
    if st.sidebar.button("Save / Load profile", use_container_width=True) and new_profile_name.strip():
        st.session_state.active_profile = new_profile_name.strip()
        st.rerun()

    st.sidebar.caption("Progress is automatically saved to JSON files in `data/user_profiles/`.")

    st.sidebar.divider()
    st.sidebar.subheader("Backup & restore")
    st.sidebar.download_button(
        "Download JSON backup",
        data=export_profile_json(profile),
        file_name=f"{profile['username'].lower().replace(' ', '_')}_progress_backup.json",
        mime="application/json",
        use_container_width=True,
    )
    restore_file = st.sidebar.file_uploader("Restore profile backup", type=["json"])
    if restore_file is not None and st.sidebar.button("Restore uploaded backup", use_container_width=True):
        with st.spinner("Restoring profile backup..."):
            restored = restore_profile_backup(restore_file.getvalue(), modules)
        st.session_state.active_profile = restored["username"]
        st.toast("Backup restored successfully")
        st.rerun()

    st.sidebar.divider()
    st.sidebar.subheader("Danger zone")
    confirm_reset = st.sidebar.checkbox("I understand this resets the active profile")
    if st.sidebar.button("Reset progress", type="secondary", use_container_width=True, disabled=not confirm_reset):
        reset_profile(profile, modules)
        st.toast("Progress reset")
        navigate_to_home()
        st.rerun()

    return profile


def render_top_bar(profile: dict) -> dict:
    left, middle, right = st.columns([1.4, 2.6, 1.2])
    with left:
        st.markdown("## 🎓 Python Tutor App")
        st.caption(f"Welcome back, **{profile['username']}**")
    with middle:
        difficulty = st.select_slider(
            "Difficulty",
            options=DIFFICULTIES,
            value=st.session_state.current_difficulty,
            help="Switch explanation depth and code complexity instantly.",
        )
        if difficulty != st.session_state.current_difficulty:
            st.session_state.current_difficulty = difficulty
            update_profile_difficulty(profile, difficulty)
            st.toast(f"Difficulty set to {difficulty}")
    with right:
        st.write("")
        if st.button("🏠 Home", use_container_width=True):
            navigate_to_home()
            st.rerun()
        if st.button("📊 Analytics", use_container_width=True):
            navigate_to_analytics()
            st.rerun()
    return profile


def main() -> None:
    st.set_page_config(page_title="Python Tutor App", page_icon="🐍", layout="wide")
    apply_global_styles()

    modules = get_chapters()
    initialize_session(default_profile="Guest")
    profile = create_or_load_profile(st.session_state.active_profile, modules)
    st.session_state.active_profile = profile["username"]
    st.session_state.current_difficulty = profile["last_difficulty"]

    render_profile_sidebar(profile, modules)
    render_top_bar(profile)

    route = st.session_state.route
    if route == "module" and st.session_state.selected_module_id:
        render_module_detail_page(profile, modules)
    elif route == "lesson" and st.session_state.selected_module_id and st.session_state.selected_lesson_id:
        render_lesson_view(profile, modules)
    elif route == "analytics":
        render_analytics_page(profile, modules)
    else:
        render_home_page(profile, modules)

    save_profile(profile)


if __name__ == "__main__":
    main()
