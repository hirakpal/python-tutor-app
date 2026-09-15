# Python Tutor App

A Streamlit-based Python tutor application that teaches core Python topics from **Beginner** to **God** level with matching code examples, explanations, progress tracking, and RAG-powered custom lesson generation from official Python docs.

## Features

- Streamlit dashboard with difficulty toggle (Beginner, Average, Expert, God)
- Starter lessons with progress tracking and JSON export
- **RAG custom lesson generator** backed by Python tutorial docs: https://docs.python.org/3/tutorial/index.html
- Retrieval coverage for Python tutorial chapters 1-9 (interpreter, basics, control flow, data structures, modules, I/O, exceptions, classes, stdlib)
- Similarity search across documentation chunks
- Related topic suggestions and quiz prompts for generated lessons
- Generated lesson/topic progress persistence in `data/user_progress.json`

## Project Structure

```text
python-tutor-app/
├── app.py
├── document_loader.py
├── embeddings.py
├── rag_system.py
├── lessons_rag.py
├── data/
│   ├── user_progress.json
│   ├── python_docs/
│   │   └── tutorial_cache.json
│   └── embeddings/
├── lessons/
│   ├── __init__.py
│   └── content.py
├── utils/
│   ├── __init__.py
│   └── progress.py
├── requirements.txt
├── RAG_README.md
└── README.md
```

## Run Locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

See `RAG_README.md` for architecture and RAG workflow details.
