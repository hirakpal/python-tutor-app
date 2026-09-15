# Python Tutor App

A Streamlit-based Python learning app with chapter cards, routed lesson flows, progress persistence, analytics, and RAG-powered custom lesson generation based on the official Python tutorial.

## Features

- 11 module cards covering the Python tutorial chapters requested in the issue
- Difficulty toggle for **Beginner**, **Average**, **Expert**, and **God**
- Home dashboard with progress, filters, sorting, and continue-learning shortcuts
- Module detail pages with ordered lesson lists and progress bars
- Lesson view with code examples, explanations, docs links, quiz prompts, and next/previous navigation
- JSON-backed profile persistence with backup, restore, reset, and export flows
- Analytics page with progress charts, streaks, learning time, and achievement badges
- RAG custom lesson generation backed by the official Python tutorial docs

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

See `RAG_README.md` for the retrieval architecture and RAG workflow details.

## Tests

```bash
python -m unittest discover -s tests -v
```
