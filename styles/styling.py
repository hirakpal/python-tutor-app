from __future__ import annotations

import streamlit as st


def apply_global_styles() -> None:
    st.markdown(
        """
        <style>
        .module-card {
            border: 1px solid rgba(148, 163, 184, 0.35);
            border-radius: 18px;
            padding: 1rem 1rem 0.75rem 1rem;
            background: linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(241,245,249,0.85) 100%);
            box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
            min-height: 270px;
            margin-bottom: 1rem;
        }
        .module-card.highlight {
            border: 2px solid #2563eb;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
        }
        .module-title {
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }
        .module-meta {
            color: #475569;
            font-size: 0.92rem;
            margin-bottom: 0.35rem;
        }
        .status-badge {
            display: inline-block;
            padding: 0.2rem 0.65rem;
            border-radius: 999px;
            font-size: 0.78rem;
            font-weight: 700;
            color: white;
            margin-bottom: 0.6rem;
        }
        .status-not-started { background: #64748b; }
        .status-in-progress { background: #2563eb; }
        .status-completed { background: #16a34a; }
        .difficulty-chip {
            display: inline-block;
            padding: 0.15rem 0.55rem;
            border-radius: 999px;
            font-size: 0.8rem;
            font-weight: 700;
            color: white;
        }
        .breadcrumb {
            color: #64748b;
            margin-bottom: 0.5rem;
        }
        .lesson-row {
            border: 1px solid rgba(148, 163, 184, 0.25);
            border-radius: 14px;
            padding: 0.85rem 0.95rem;
            margin-bottom: 0.65rem;
            background: #ffffff;
        }
        .lesson-row.current {
            border-color: #2563eb;
            background: rgba(239, 246, 255, 0.85);
        }
        </style>
        """,
        unsafe_allow_html=True,
    )
