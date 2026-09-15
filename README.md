# python-tutor-app

A Streamlit-based Python learning app with chapter cards, multi-level lesson flows, progress persistence, and analytics built around the official Python tutorial.

## Features

- 11 module cards covering the Python tutorial chapters requested in the issue
- Difficulty toggle for **Beginner**, **Average**, **Expert**, and **God** explanations
- Home dashboard with progress, filters, sorting, and continue-learning shortcuts
- Module detail pages with ordered lesson lists and progress bars
- Lesson view with code examples, explanations, docs links, quiz prompts, and next/previous navigation
- JSON-backed profile persistence with backup, restore, and reset flows
- Analytics page with progress charts, streaks, learning time, exports, and achievement badges

## Run locally

```bash
pip install -r requirements.txt
streamlit run app.py
```

## Tests

```bash
python -m unittest discover -s tests -v
```
