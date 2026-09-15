# Python Tutor App

A Streamlit-based Python tutor application that teaches core Python topics from **Beginner** to **God** level with matching code examples, explanations, and persistent progress tracking.

## Features

- Streamlit dashboard with a clean two-column learning layout
- Difficulty toggle with 4 levels: Beginner, Average, Expert, God
- Five starter lessons:
  - Python Basics
  - String Operations
  - Lists and Collections
  - Functions
  - Conditionals and Loops
- Sequential lesson unlocking
- Session-based learner profiles
- Persistent JSON progress storage
- Completion percentage, completed lesson count, and time spent stats
- Search/filter lessons
- Syntax-highlighted code viewer
- Exportable JSON progress report

## Project Structure

```text
python-tutor-app/
├── app.py
├── data/
│   └── user_progress.json
├── lessons/
│   ├── __init__.py
│   └── content.py
├── utils/
│   ├── __init__.py
│   └── progress.py
├── requirements.txt
├── .gitignore
└── README.md
```

## Run Locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

## Progress Tracking

- Progress is stored in `data/user_progress.json`
- Each profile keeps:
  - completed lessons
  - total time spent
  - last active timestamp
- Reuse the same profile name to resume learning later
