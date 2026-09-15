from __future__ import annotations

import unittest
from urllib.parse import urlparse

from document_loader import PythonTutorialLoader
from lessons_rag import RAGLessonGenerator


class TestRAGSystem(unittest.TestCase):
    def test_loader_covers_nine_chapters(self) -> None:
        docs = PythonTutorialLoader(use_cache=True).load(refresh=False)
        chapter_ids = {doc.metadata.get("chapter_id") for doc in docs}
        self.assertEqual(len(docs), 9)
        self.assertEqual(len(chapter_ids), 9)
        self.assertIn("chapter-4", chapter_ids)

    def test_lesson_generation_includes_sources_and_quiz(self) -> None:
        generator = RAGLessonGenerator()
        lesson = generator.generate_lesson("lists", "Beginner")

        self.assertEqual(lesson.difficulty, "Beginner")
        self.assertTrue(lesson.sources)
        self.assertTrue(
            any(urlparse(source["url"]).netloc == "docs.python.org" for source in lesson.sources)
        )
        self.assertTrue(lesson.code_examples)
        self.assertEqual(len(lesson.quiz), 3)


if __name__ == "__main__":
    unittest.main()
