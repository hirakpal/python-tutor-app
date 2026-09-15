from __future__ import annotations

import streamlit as st


def initialize_session(default_profile: str = "Guest") -> None:
    st.session_state.setdefault("active_profile", default_profile)
    st.session_state.setdefault("route", "home")
    st.session_state.setdefault("selected_module_id", None)
    st.session_state.setdefault("selected_lesson_id", None)
    st.session_state.setdefault("current_difficulty", "Beginner")
    st.session_state.setdefault("lesson_started_at", None)


def navigate_to_home() -> None:
    st.session_state.route = "home"
    st.session_state.selected_module_id = None
    st.session_state.selected_lesson_id = None
    st.session_state.lesson_started_at = None


def navigate_to_analytics() -> None:
    st.session_state.route = "analytics"
    st.session_state.selected_lesson_id = None
    st.session_state.lesson_started_at = None


def navigate_to_module(module_id: str) -> None:
    st.session_state.route = "module"
    st.session_state.selected_module_id = module_id
    st.session_state.selected_lesson_id = None
    st.session_state.lesson_started_at = None


def navigate_to_lesson(module_id: str, lesson_id: str) -> None:
    st.session_state.route = "lesson"
    st.session_state.selected_module_id = module_id
    st.session_state.selected_lesson_id = lesson_id
    st.session_state.lesson_started_at = None
