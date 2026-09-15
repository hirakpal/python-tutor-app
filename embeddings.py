from __future__ import annotations

import hashlib
import math
import re
from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter


EMBEDDINGS_DIR = Path(__file__).resolve().parent / "data" / "embeddings"
VECTOR_STORE_DIR = EMBEDDINGS_DIR / "python_docs"


class LocalTokenEmbeddings(Embeddings):
    """Offline-safe token hashing embeddings for local semantic similarity."""

    def __init__(self, dimension: int = 256) -> None:
        self.dimension = dimension

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed(text)

    def _embed(self, text: str) -> list[float]:
        tokens = re.findall(r"[a-zA-Z_]+", text.lower())
        if not tokens:
            return [0.0] * self.dimension

        vector = [0.0] * self.dimension
        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
            index = int(digest[:8], 16) % self.dimension
            vector[index] += 1.0

        norm = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / norm for value in vector]


class TutorialVectorStore:
    def __init__(self, embedding_model: Embeddings | None = None) -> None:
        self.embedding_model = embedding_model or LocalTokenEmbeddings()

    def build_or_load(
        self,
        documents: list[Document],
        force_rebuild: bool = False,
    ) -> FAISS:
        EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)
        if VECTOR_STORE_DIR.exists() and not force_rebuild:
            return FAISS.load_local(
                str(VECTOR_STORE_DIR),
                self.embedding_model,
                allow_dangerous_deserialization=True,
            )

        split_docs = self._split_documents(documents)
        vector_store = FAISS.from_documents(split_docs, self.embedding_model)
        vector_store.save_local(str(VECTOR_STORE_DIR))
        return vector_store

    def _split_documents(self, documents: list[Document]) -> list[Document]:
        splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=120)
        return splitter.split_documents(documents)
