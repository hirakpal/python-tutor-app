from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.error import URLError
from urllib.request import urlopen

from langchain_core.documents import Document


DOCS_BASE_URL = "https://docs.python.org/3/tutorial"
DATA_DIR = Path(__file__).resolve().parent / "data" / "python_docs"
CACHE_FILE = DATA_DIR / "tutorial_cache.json"


@dataclass(frozen=True)
class TutorialChapter:
    id: str
    title: str
    url: str
    topics: tuple[str, ...]


CHAPTERS: tuple[TutorialChapter, ...] = (
    TutorialChapter(
        id="chapter-1",
        title="Using the Python Interpreter",
        url=f"{DOCS_BASE_URL}/interpreter.html",
        topics=("interpreter", "interactive mode", "python shell", "basic concepts"),
    ),
    TutorialChapter(
        id="chapter-2",
        title="An Informal Introduction to Python",
        url=f"{DOCS_BASE_URL}/introduction.html",
        topics=("numbers", "strings", "first steps"),
    ),
    TutorialChapter(
        id="chapter-3",
        title="More Control Flow Tools",
        url=f"{DOCS_BASE_URL}/controlflow.html",
        topics=("if", "while", "for", "range", "break", "continue"),
    ),
    TutorialChapter(
        id="chapter-4",
        title="Data Structures",
        url=f"{DOCS_BASE_URL}/datastructures.html",
        topics=("lists", "tuples", "sets", "dictionaries"),
    ),
    TutorialChapter(
        id="chapter-5",
        title="Modules",
        url=f"{DOCS_BASE_URL}/modules.html",
        topics=("imports", "sys module", "dir"),
    ),
    TutorialChapter(
        id="chapter-6",
        title="Input and Output",
        url=f"{DOCS_BASE_URL}/inputoutput.html",
        topics=("print", "input", "files"),
    ),
    TutorialChapter(
        id="chapter-7",
        title="Errors and Exceptions",
        url=f"{DOCS_BASE_URL}/errors.html",
        topics=("try", "except", "raise", "exceptions"),
    ),
    TutorialChapter(
        id="chapter-8",
        title="Classes",
        url=f"{DOCS_BASE_URL}/classes.html",
        topics=("oop", "class", "inheritance"),
    ),
    TutorialChapter(
        id="chapter-9",
        title="Brief Tour of the Standard Library",
        url=f"{DOCS_BASE_URL}/stdlib.html",
        topics=("standard library", "modules", "overview"),
    ),
)

FALLBACK_CONTENT: dict[str, str] = {
    "chapter-1": """
Using the Python interpreter starts by running `python` from your terminal.
Interactive mode executes code line by line and is useful for quick experiments.
Example:
>>> 2 + 2
4
>>> print('hello python')
hello python
""".strip(),
    "chapter-2": """
Python supports numbers (int, float) and strings. Strings can be in single or double quotes.
Example:
>>> price = 19.5
>>> message = 'Learning Python'
>>> print(message, price)
Learning Python 19.5
""".strip(),
    "chapter-3": """
Control flow tools include if/elif/else, for loops, while loops, and range().
Use break to stop a loop and continue to skip to the next iteration.
Example:
>>> for number in range(5):
...     if number == 3:
...         break
...     print(number)
0
1
2
""".strip(),
    "chapter-4": """
Data structures include lists, tuples, sets, and dictionaries.
Lists are mutable sequences with helpful methods like append and sort.
Example:
>>> squares = [1, 4, 9]
>>> squares.append(16)
>>> squares
[1, 4, 9, 16]
""".strip(),
    "chapter-5": """
Modules let you organize reusable code and import features with import statements.
The sys module exposes interpreter settings such as sys.path.
Example:
>>> import sys
>>> 'python' in sys.executable.lower()
True
""".strip(),
    "chapter-6": """
Input/output includes print formatting, reading input(), and file operations with open().
Use with open(...) as file for safe file handling.
Example:
>>> with open('example.txt', 'w', encoding='utf-8') as file:
...     _ = file.write('python tutorial')
""".strip(),
    "chapter-7": """
Exception handling uses try/except/else/finally blocks.
Use raise to trigger exceptions intentionally for invalid states.
Example:
>>> try:
...     10 / 0
... except ZeroDivisionError:
...     print('Cannot divide by zero')
Cannot divide by zero
""".strip(),
    "chapter-8": """
Classes define custom object behavior with attributes and methods.
Inheritance lets a class reuse and extend behavior from another class.
Example:
>>> class Animal:
...     def speak(self):
...         return 'sound'
>>> class Dog(Animal):
...     pass
>>> Dog().speak()
'sound'
""".strip(),
    "chapter-9": """
The standard library includes batteries-included modules such as pathlib, datetime, and statistics.
Example:
>>> from statistics import mean
>>> mean([2, 4, 6])
4
""".strip(),
}

RELATED_TOPICS: dict[str, list[str]] = {
    "chapter-1": ["chapter-2"],
    "chapter-2": ["chapter-3", "chapter-4"],
    "chapter-3": ["chapter-4", "chapter-7"],
    "chapter-4": ["chapter-5", "chapter-8"],
    "chapter-5": ["chapter-9"],
    "chapter-6": ["chapter-7"],
    "chapter-7": ["chapter-8"],
    "chapter-8": ["chapter-9"],
    "chapter-9": [],
}


class PythonTutorialLoader:
    def __init__(self, use_cache: bool = True, timeout_seconds: int = 8) -> None:
        self.use_cache = use_cache
        self.timeout_seconds = timeout_seconds

    def load(self, refresh: bool = False) -> list[Document]:
        chapters_data = self._load_chapter_content(refresh=refresh)
        documents: list[Document] = []
        for chapter in CHAPTERS:
            text = chapters_data.get(chapter.id, FALLBACK_CONTENT[chapter.id])
            documents.append(
                Document(
                    page_content=text,
                    metadata={
                        "chapter_id": chapter.id,
                        "title": chapter.title,
                        "source": chapter.url,
                        "topics": list(chapter.topics),
                        "related_topics": RELATED_TOPICS.get(chapter.id, []),
                    },
                )
            )
        return documents

    def _load_chapter_content(self, refresh: bool = False) -> dict[str, str]:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        if self.use_cache and CACHE_FILE.exists() and not refresh:
            return json.loads(CACHE_FILE.read_text(encoding="utf-8"))

        chapter_content: dict[str, str] = {}
        for chapter in CHAPTERS:
            chapter_content[chapter.id] = self._fetch_or_fallback(chapter)

        CACHE_FILE.write_text(json.dumps(chapter_content, indent=2), encoding="utf-8")
        return chapter_content

    def _fetch_or_fallback(self, chapter: TutorialChapter) -> str:
        try:
            with urlopen(chapter.url, timeout=self.timeout_seconds) as response:
                html = response.read().decode("utf-8", errors="ignore")
            text = _html_to_text(html)
            if text:
                return text[:12000]
        except (TimeoutError, URLError, OSError, ValueError):
            pass
        return FALLBACK_CONTENT[chapter.id]


def _html_to_text(html: str) -> str:
    cleaned = re.sub(r"<script[\\s\\S]*?</script>", " ", html, flags=re.IGNORECASE)
    cleaned = re.sub(r"<style[\\s\\S]*?</style>", " ", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    cleaned = re.sub(r"\\s+", " ", cleaned).strip()
    return cleaned


def chapter_map(chapters: Iterable[TutorialChapter] = CHAPTERS) -> dict[str, TutorialChapter]:
    return {chapter.id: chapter for chapter in chapters}
