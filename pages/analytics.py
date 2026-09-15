from __future__ import annotations

import streamlit as st

from utils.analytics import (
    achievement_badges,
    completion_stats,
    difficulty_distribution,
    learning_time_by_module,
    lessons_completed_by_day,
    status_distribution,
)
from utils.progress import export_profile_json, export_profile_pdf


def _vega_pie(data: list[dict]) -> dict:
    return {
        "mark": {"type": "arc", "innerRadius": 30},
        "encoding": {
            "theta": {"field": "count", "type": "quantitative"},
            "color": {"field": "status", "type": "nominal"},
            "tooltip": [{"field": "status"}, {"field": "count"}],
        },
        "data": {"values": data},
    }


def _vega_bar(data: list[dict], x_field: str, y_field: str, color: str = "#2563eb") -> dict:
    return {
        "mark": {"type": "bar", "tooltip": True, "color": color},
        "encoding": {
            "x": {"field": x_field, "type": "nominal", "sort": None},
            "y": {"field": y_field, "type": "quantitative"},
        },
        "data": {"values": data},
    }


def render_analytics_page(profile: dict, modules: list[dict]) -> None:
    stats = completion_stats(profile, modules)
    st.markdown("<div class='breadcrumb'>Home &gt; Analytics</div>", unsafe_allow_html=True)
    st.title("📊 Progress analytics")

    top = st.columns(4)
    top[0].metric("Overall progress", f"{stats['overall_progress']}%")
    top[1].metric("Completed modules", stats["completed_modules"])
    top[2].metric("Learning time", f"{stats['total_learning_minutes']} min")
    top[3].metric("Current streak", f"{stats['current_streak']} day(s)")

    left, right = st.columns(2)
    left.subheader("Modules by progress")
    left.vega_lite_chart(_vega_pie(status_distribution(profile, modules)), use_container_width=True)

    right.subheader("Learning time by module")
    right.vega_lite_chart(_vega_bar(learning_time_by_module(profile, modules), "module", "minutes", "#7c3aed"), use_container_width=True)

    lower_left, lower_right = st.columns(2)
    lower_left.subheader("Lessons completed per day")
    daily = lessons_completed_by_day(profile) or [{"day": "No activity yet", "lessons": 0}]
    lower_left.vega_lite_chart(_vega_bar(daily, "day", "lessons", "#16a34a"), use_container_width=True)

    lower_right.subheader("Difficulty distribution")
    lower_right.vega_lite_chart(_vega_bar(difficulty_distribution(profile), "difficulty", "count", "#dc2626"), use_container_width=True)

    st.subheader("Achievement badges")
    st.write("  ".join(achievement_badges(profile, modules)))

    export_left, export_right = st.columns(2)
    export_left.download_button(
        "Export progress as JSON",
        data=export_profile_json(profile),
        file_name=f"{profile['username'].lower().replace(' ', '_')}_progress.json",
        mime="application/json",
        use_container_width=True,
    )
    export_right.download_button(
        "Export progress as PDF",
        data=export_profile_pdf(profile, modules),
        file_name=f"{profile['username'].lower().replace(' ', '_')}_progress.pdf",
        mime="application/pdf",
        use_container_width=True,
    )
