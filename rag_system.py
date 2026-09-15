from __future__ import annotations

from dataclasses import dataclass

from langchain_core.documents import Document

from document_loader import PythonTutorialLoader, chapter_map
from embeddings import TutorialVectorStore


@dataclass
class RetrievedSection:
    chapter_id: str
    title: str
    source: str
    content: str
    related_chapter_ids: list[str]


class PythonDocsRAG:
    def __init__(self) -> None:
        self.loader = PythonTutorialLoader(use_cache=True)
        self.chapter_lookup = chapter_map()
        self._documents = self.loader.load()
        self._vector_store = TutorialVectorStore().build_or_load(self._documents)

    def refresh_index(self) -> None:
        self._documents = self.loader.load(refresh=True)
        self._vector_store = TutorialVectorStore().build_or_load(self._documents, force_rebuild=True)

    def retrieve(self, query: str, k: int = 4) -> list[RetrievedSection]:
        query_lower = query.lower().strip()
        candidates = self._vector_store.similarity_search_with_score(query, k=max(k * 3, 9))

        reranked: list[tuple[float, Document]] = []
        for document, score in candidates:
            topics = [item.lower() for item in document.metadata.get("topics", [])]
            topic_hits = sum(1 for topic in topics if topic and topic in query_lower)
            adjusted_score = float(score) - (topic_hits * 0.35)
            reranked.append((adjusted_score, document))

        reranked.sort(key=lambda item: item[0])

        unique_by_chapter: dict[str, RetrievedSection] = {}
        for _, document in reranked:
            section = self._to_section(document)
            if section.chapter_id not in unique_by_chapter:
                unique_by_chapter[section.chapter_id] = section
            if len(unique_by_chapter) >= k:
                break

        return list(unique_by_chapter.values())

    def similarity_search(self, query: str, k: int = 5) -> list[dict]:
        docs = self._vector_store.similarity_search_with_score(query, k=k)
        results: list[dict] = []
        for document, score in docs:
            section = self._to_section(document)
            results.append(
                {
                    "chapter_id": section.chapter_id,
                    "title": section.title,
                    "source": section.source,
                    "preview": section.content[:260],
                    "score": round(float(score), 4),
                }
            )
        return results

    def related_chapters(self, chapter_id: str) -> list[dict[str, str]]:
        chapter = self.chapter_lookup.get(chapter_id)
        if not chapter:
            return []

        related_ids = []
        for document in self._documents:
            if document.metadata.get("chapter_id") == chapter_id:
                related_ids = document.metadata.get("related_topics", [])
                break

        related = []
        for rel_id in related_ids:
            rel_chapter = self.chapter_lookup.get(rel_id)
            if rel_chapter:
                related.append(
                    {
                        "chapter_id": rel_chapter.id,
                        "title": rel_chapter.title,
                        "source": rel_chapter.url,
                    }
                )
        return related

    def _to_section(self, document: Document) -> RetrievedSection:
        return RetrievedSection(
            chapter_id=document.metadata.get("chapter_id", "unknown"),
            title=document.metadata.get("title", "Python Tutorial"),
            source=document.metadata.get("source", "https://docs.python.org/3/tutorial/index.html"),
            content=document.page_content,
            related_chapter_ids=document.metadata.get("related_topics", []),
        )
