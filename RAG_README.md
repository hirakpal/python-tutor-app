# RAG System Documentation

## Overview

This app includes a local Retrieval-Augmented Generation (RAG) pipeline grounded in the official Python tutorial:

- Source index: https://docs.python.org/3/tutorial/index.html
- Coverage: chapters 1-9
- Retrieval: LangChain document chunks + FAISS vector store
- Embeddings: offline-safe token hashing embeddings

## Modules

- `document_loader.py`
  - Defines chapter map for Python tutorial coverage
  - Fetches tutorial pages and strips HTML
  - Falls back to cached/seeded chapter summaries when offline
  - Stores cache in `data/python_docs/tutorial_cache.json`

- `embeddings.py`
  - Builds local embeddings for docs
  - Splits text with `RecursiveCharacterTextSplitter`
  - Persists FAISS index in `data/embeddings/python_docs`

- `rag_system.py`
  - Provides retrieval and similarity search APIs
  - Returns source URL, chapter metadata, and related chapter suggestions

- `lessons_rag.py`
  - Implements `RAGLessonGenerator`
  - Generates topic lessons at 4 levels: Beginner, Average, Expert, God
  - Includes tutorial-derived code examples, source links, and quiz prompts

## Streamlit Integration

`app.py` adds **Generate Custom Lesson (RAG)**:

1. User enters a topic (example: "lists")
2. RAG retrieves relevant Python tutorial sections
3. Lesson is rendered at selected difficulty level
4. Source links are shown to official docs
5. User can save generated lesson and mark topic learned
6. Similarity search helps discover nearby lessons

## Local Data

- `data/python_docs/` - documentation cache
- `data/embeddings/` - FAISS persistence
- `data/user_progress.json` stores:
  - `completed_lessons`
  - `learned_topics`
  - `generated_lessons`
  - session timestamps and time spent

## Example Workflow

User: "Teach me about lists in Python"

- Retriever finds chapter 4 (Data Structures)
- Lesson generator creates level-specific explanation
- Displays tutorial examples and official doc links
- Suggests related topics (modules, classes)
- User saves lesson and tracks progress
