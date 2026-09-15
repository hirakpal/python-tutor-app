from __future__ import annotations

import re
from dataclasses import dataclass

from rag_system import PythonDocsRAG


DIFFICULTY_GUIDANCE = {
    "Beginner": "Use short, plain-language explanation for a slow learner and avoid jargon.",
    "Average": "Use moderately detailed explanation with practical examples and basic best practices.",
    "Expert": "Use technical explanation with stronger terminology and implementation notes.",
    "God": "Use advanced perspective, trade-offs, patterns, and optimization insights.",
}


@dataclass
class GeneratedLesson:
    topic: str
    difficulty: str
    summary: str
    explanation: str
    code_examples: list[str]
    sources: list[dict[str, str]]
    related_lessons: list[dict[str, str]]
    quiz: list[dict[str, str]]


class RAGLessonGenerator:
    def __init__(self, rag: PythonDocsRAG | None = None) -> None:
        self.rag = rag or PythonDocsRAG()

    def generate_lesson(self, topic_query: str, difficulty: str) -> GeneratedLesson:
        difficulty = difficulty if difficulty in DIFFICULTY_GUIDANCE else "Beginner"
        sections = self.rag.retrieve(topic_query, k=4)

        if not sections:
            return GeneratedLesson(
                topic=topic_query,
                difficulty=difficulty,
                summary="No matching section found in Python tutorial index.",
                explanation="Try a specific topic such as lists, classes, exceptions, modules, or for loops.",
                code_examples=[],
                sources=[{"title": "Python Tutorial", "url": "https://docs.python.org/3/tutorial/index.html"}],
                related_lessons=[],
                quiz=[],
            )

        top = sections[0]
        snippets = [self._compact_text(section.content) for section in sections]
        summary = f"Matched {top.title} from the official Python tutorial."
        explanation = (
            f"{DIFFICULTY_GUIDANCE[difficulty]}\n\n"
            f"Topic query: {topic_query}\n\n"
            f"Key ideas:\n- " + "\n- ".join(snippets[:3])
        )

        examples = self._extract_examples([section.content for section in sections])
        sources = [{"title": section.title, "url": section.source} for section in sections]
        related = self.rag.related_chapters(top.chapter_id)
        quiz = self._build_quiz(topic_query, snippets)

        return GeneratedLesson(
            topic=topic_query,
            difficulty=difficulty,
            summary=summary,
            explanation=explanation,
            code_examples=examples,
            sources=sources,
            related_lessons=related,
            quiz=quiz,
        )

    def search_topics(self, query: str, limit: int = 5) -> list[dict]:
        return self.rag.similarity_search(query, k=limit)

    def _extract_examples(self, blocks: list[str]) -> list[str]:
        examples: list[str] = []
        for block in blocks:
            matches = re.findall(r"(?:>>> .*?(?:\n\.\.\. .*?)*)", block)
            for match in matches:
                cleaned = "\n".join(line.replace(">>> ", "").replace("... ", "") for line in match.splitlines())
                if cleaned and cleaned not in examples:
                    examples.append(cleaned)
            if len(examples) >= 3:
                break

        if not examples:
            examples.append("print('Practice this topic with your own values')")
        return examples[:3]

    def _build_quiz(self, topic_query: str, snippets: list[str]) -> list[dict[str, str]]:
        base = snippets[0] if snippets else topic_query
        return [
            {
                "question": f"In your own words, what is the purpose of {topic_query}?",
                "answer_hint": "Focus on when and why you would use it.",
            },
            {
                "question": "Which Python syntax from this lesson should you memorize first?",
                "answer_hint": base[:120],
            },
            {
                "question": "How would you modify the example for your own mini project?",
                "answer_hint": "Change variable names and input values, then run the code.",
            },
        ]

    def _compact_text(self, text: str) -> str:
        normalized = " ".join(text.split())
        return normalized[:200] + ("..." if len(normalized) > 200 else "")
