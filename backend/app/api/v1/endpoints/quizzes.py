"""Quiz and Ethiopian National Exit Exam Endpoints."""

import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
from app.models.material import Document, DocumentChunk, QuizQuestion
from app.schemas.material import QuizQuestionResponse
from app.services.ai_service import ai_service
from app.services.exit_exam_data import get_exit_exam_questions

router = APIRouter()


@router.get(
    "/",
    response_model=List[QuizQuestionResponse],
    summary="List quiz questions",
)
async def list_quizzes(
    document_id: Optional[uuid.UUID] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db_session),
) -> List[QuizQuestionResponse]:
    """Retrieves practice questions, optionally filtered by document or category."""
    stmt = select(QuizQuestion)
    if document_id:
        stmt = stmt.where(QuizQuestion.document_id == document_id)
    if category:
        stmt = stmt.where(QuizQuestion.category == category)
    stmt = stmt.order_by(QuizQuestion.created_at.desc())

    result = await db.execute(stmt)
    questions = result.scalars().all()

    response = []
    for q in questions:
        try:
            options = json.loads(q.options_json)
        except Exception:
            options = []
        response.append(
            QuizQuestionResponse(
                id=q.id,
                document_id=q.document_id,
                category=q.category,
                question=q.question,
                options=options,
                correct_index=q.correct_index,
                explanation=q.explanation,
                source_citation=q.source_citation,
            )
        )
    return response


@router.post(
    "/generate/{document_id}",
    response_model=List[QuizQuestionResponse],
    summary="Generate practice exam questions from a document",
)
async def generate_document_quiz(
    document_id: uuid.UUID,
    count: int = 4,
    language: str = "en",
    db: AsyncSession = Depends(get_db_session),
) -> List[QuizQuestionResponse]:
    """Uses AI to generate multiple choice quiz questions based on uploaded notes."""
    stmt = select(Document).where(Document.id == document_id)
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    chunk_stmt = select(DocumentChunk).where(DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index)
    db_chunks = (await db.execute(chunk_stmt)).scalars().all()
    if not db_chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document has no parsed text chunks yet.",
        )

    chunks_data = [
        {"page_number": c.page_number, "content": c.content, "chunk_index": c.chunk_index}
        for c in db_chunks
    ]

    generated = await ai_service.generate_quiz(
        chunks=chunks_data,
        document_title=doc.title,
        count=count,
        language=language,
    )

    saved_questions = []
    for item in generated:
        q = QuizQuestion(
            document_id=doc.id,
            category=f"Material: {doc.title[:30]}",
            question=item["question"],
            options_json=json.dumps(item["options"]),
            correct_index=item["correct_index"],
            explanation=item["explanation"],
            source_citation=item.get("source_citation"),
        )
        db.add(q)
        saved_questions.append((q, item["options"]))

    await db.commit()

    response = []
    for q, options in saved_questions:
        await db.refresh(q)
        response.append(
            QuizQuestionResponse(
                id=q.id,
                document_id=q.document_id,
                category=q.category,
                question=q.question,
                options=options,
                correct_index=q.correct_index,
                explanation=q.explanation,
                source_citation=q.source_citation,
            )
        )
    return response


@router.get(
    "/exit-exams",
    response_model=List[QuizQuestionResponse],
    summary="Get curated Ethiopian National Exit Exam questions",
)
async def get_exit_exams(category: str = "all") -> List[QuizQuestionResponse]:
    """Retrieves Ministry of Education Exit Exam questions across departments."""
    raw_data = get_exit_exam_questions(category)
    result = []
    for item in raw_data:
        result.append(
            QuizQuestionResponse(
                id=uuid.uuid4(),
                document_id=None,
                category=f"National Exit Exam: {category.replace('_', ' ').title()}",
                question=item["question"],
                options=item["options"],
                correct_index=item["correct_index"],
                explanation=item["explanation"],
                source_citation=item.get("source_citation"),
            )
        )
    return result
