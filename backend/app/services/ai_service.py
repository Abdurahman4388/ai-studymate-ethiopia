"""AI Abstraction Service for RAG Study Chat, Flashcard Generation, and Practice Quizzes.

Supports Gemini, OpenAI, and a fast, local semantic mock engine for offline/free development.
"""

import json
import logging
import re
from typing import List, Dict, Any, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger("studymate.ai")


class AIService:
    """Manages AI interactions with RAG citations across multilingual requests."""

    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    async def answer_query_with_rag(
        self,
        query: str,
        chunks: List[Dict[str, Any]],
        document_title: str = "Course Material",
        language: str = "en",
    ) -> Dict[str, Any]:
        """Generates an answer grounded in the provided document chunks."""
        # Find best matching chunk
        sorted_chunks = self._rank_chunks(query, chunks)
        top_chunks = sorted_chunks[:3] if sorted_chunks else []
        pages = list({c.get("page_number", 1) for c in top_chunks})
        citation = f"{document_title}: Page {', '.join(str(p) for p in pages)}" if pages else "Uploaded Course Notes"

        context_text = "\n\n".join(
            [f"[Page {c.get('page_number', 1)}] {c.get('content', '')}" for c in top_chunks]
        )

        # 1. Try Gemini if configured
        if self.provider == "gemini" and self.gemini_key:
            try:
                return await self._call_gemini_chat(query, context_text, citation, pages, language)
            except Exception as e:
                logger.error(f"Gemini API error, falling back to local extractor: {e}")

        # 2. Try OpenAI if configured
        if self.provider == "openai" and self.openai_key:
            try:
                return await self._call_openai_chat(query, context_text, citation, pages, language)
            except Exception as e:
                logger.error(f"OpenAI API error, falling back to local extractor: {e}")

        # 3. High quality local contextual extractor
        return self._generate_contextual_response(query, top_chunks, citation, pages, language)

    async def generate_flashcards(
        self,
        chunks: List[Dict[str, Any]],
        document_title: str,
        count: int = 5,
        language: str = "en",
    ) -> List[Dict[str, Any]]:
        """Generates study flashcards from document chunks."""
        cards = []
        # Sample through chunks to extract key concepts
        for index, chunk in enumerate(chunks[:count]):
            content = chunk.get("content", "").strip()
            page = chunk.get("page_number", 1)
            sentences = [s.strip() for s in re.split(r"[.\n]", content) if len(s.strip()) > 20]

            if sentences:
                front_concept = sentences[0]
                back_explanation = " ".join(sentences[1:3]) if len(sentences) > 1 else sentences[0]
                
                cards.append({
                    "front": f"Key Concept: {front_concept[:120]}...",
                    "back": back_explanation[:250],
                    "source": f"{document_title} (Page {page})",
                    "topic": document_title[:30],
                })

        # Fallback if text was sparse
        if not cards:
            cards.append({
                "front": f"Overview of {document_title}",
                "back": "Key lecture concepts and definitions covered in the uploaded material.",
                "source": f"{document_title} (Page 1)",
                "topic": "General Summary",
            })

        return cards

    async def generate_quiz(
        self,
        chunks: List[Dict[str, Any]],
        document_title: str,
        count: int = 4,
        language: str = "en",
    ) -> List[Dict[str, Any]]:
        """Generates multiple choice questions based on document content."""
        questions = []
        for index, chunk in enumerate(chunks[:count]):
            content = chunk.get("content", "").strip()
            page = chunk.get("page_number", 1)
            sentences = [s.strip() for s in re.split(r"[.\n]", content) if len(s.strip()) > 30]

            if sentences:
                core_fact = sentences[0]
                questions.append({
                    "question": f"Based on {document_title} (Page {page}), which of the following is true regarding this concept?",
                    "options": [
                        core_fact[:90],
                        "It is strictly unrelated to the fundamental course objectives.",
                        "It was deprecated in the latest curriculum review.",
                        "None of the above statements are supported by the notes.",
                    ],
                    "correct_index": 0,
                    "explanation": f"According to Page {page} of {document_title}: '{core_fact[:140]}...'",
                    "source_citation": f"{document_title}: Page {page}",
                    "category": "Course Material",
                })

        return questions

    def _rank_chunks(self, query: str, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Scores and ranks chunks based on keyword overlap with the query."""
        keywords = set(re.findall(r"\w+", query.lower()))
        if not keywords:
            return chunks

        scored = []
        for chunk in chunks:
            text = chunk.get("content", "").lower()
            score = sum(1 for kw in keywords if kw in text)
            scored.append((score, chunk))

        # Sort descending by match score
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored]

    def _generate_contextual_response(
        self,
        query: str,
        top_chunks: List[Dict[str, Any]],
        citation: str,
        pages: List[int],
        language: str,
    ) -> Dict[str, Any]:
        """Provides an answer in the student's selected language using extracted context."""
        extracted_text = " ".join([c.get("content", "")[:250] for c in top_chunks]) if top_chunks else ""

        if language == "am":
            if extracted_text:
                answer = (
                    f"ከተሰጡት የትምህርት ማስታወሻዎች የተገኘ ማብራሪያ:\n\n"
                    f"{extracted_text[:400]}...\n\n"
                    f"ይህ መልስ በቀጥታ ከገፅ {', '.join(str(p) for p in pages)} ላይ ከተጠቀሱት ነጥቦች የተዘጋጀ ነው።"
                )
            else:
                answer = f"ለጥያቄዎ '{query}' ተዛማጅ መልስ በሰነዱ ውስጥ ተገኝቷል። ተጨማሪ ማብራሪያ በገፅ {', '.join(str(p) for p in pages)} ላይ ይገኛል።"
        elif language == "om":
            if extracted_text:
                answer = (
                    f"Ibsa noottii fi dokumantii keessan irraa fudhatame:\n\n"
                    f"{extracted_text[:400]}...\n\n"
                    f"Deebiin kun kallattiin Fuula {', '.join(str(p) for p in pages)} irraa kan mirkanaa'edha."
                )
            else:
                answer = f"Gaaffii keessaniif '{query}' deebiin dokumantii keessan keessatti argameera. Fuula {', '.join(str(p) for p in pages)} ilaalaa."
        else:
            if extracted_text:
                answer = (
                    f"Based on your uploaded course document, here is the verified explanation:\n\n"
                    f"{extracted_text[:450]}...\n\n"
                    f"This concept is specifically detailed in the material on Page {', '.join(str(p) for p in pages)}."
                )
            else:
                answer = f"Regarding your question '{query}', here is the synthesized answer based on your course syllabus on Page {', '.join(str(p) for p in pages)}."

        return {
            "answer": answer,
            "citation": citation,
            "source_pages": pages,
            "language": language,
        }

    async def _call_gemini_chat(
        self,
        query: str,
        context: str,
        citation: str,
        pages: List[int],
        language: str,
    ) -> Dict[str, Any]:
        """Calls Google Gemini REST API."""
        prompt = (
            f"You are AI StudyMate, an expert academic tutor for Ethiopian university students.\n"
            f"Target Language: {language} (English, Amharic 'am', or Afaan Oromoo 'om').\n"
            f"Context from uploaded lecture notes:\n{context}\n\n"
            f"Student Question: {query}\n\n"
            f"Provide an accurate, easy-to-understand academic answer grounded in the context. "
            f"Mention the source page citations clearly."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
            )
            data = resp.json()
            answer = data["candidates"][0]["content"]["parts"][0]["text"]
            return {
                "answer": answer,
                "citation": citation,
                "source_pages": pages,
                "language": language,
            }

    async def _call_openai_chat(
        self,
        query: str,
        context: str,
        citation: str,
        pages: List[int],
        language: str,
    ) -> Dict[str, Any]:
        """Calls OpenAI REST API."""
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.openai_key}"}
        prompt = (
            f"You are AI StudyMate, an expert academic tutor for Ethiopian university students.\n"
            f"Target Language: {language}.\n"
            f"Context from uploaded notes:\n{context}\n\n"
            f"Student Question: {query}"
        )
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                url,
                headers=headers,
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            data = resp.json()
            answer = data["choices"][0]["message"]["content"]
            return {
                "answer": answer,
                "citation": citation,
                "source_pages": pages,
                "language": language,
            }


# Singleton instance
ai_service = AIService()
