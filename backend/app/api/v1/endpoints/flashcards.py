"""Flashcards Endpoints (List, Generate, Create)."""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
from app.models.material import Document, DocumentChunk, Flashcard
from app.schemas.material import FlashcardResponse, FlashcardCreate
from app.services.ai_service import ai_service

router = APIRouter()


@router.get(
    "/",
    response_model=List[FlashcardResponse],
    summary="List all flashcards",
)
async def list_flashcards(
    document_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db_session),
) -> List[FlashcardResponse]:
    """Retrieves all flashcards, optionally filtered by course document."""
    stmt = select(Flashcard)
    if document_id:
        stmt = stmt.where(Flashcard.document_id == document_id)
    stmt = stmt.order_by(Flashcard.created_at.desc())

    result = await db.execute(stmt)
    cards = result.scalars().all()
    return [FlashcardResponse.model_validate(c) for c in cards]


@router.post(
    "/generate/{document_id}",
    response_model=List[FlashcardResponse],
    summary="Automatically generate flashcards from an uploaded document",
)
async def generate_document_flashcards(
    document_id: uuid.UUID,
    count: int = 6,
    language: str = "en",
    db: AsyncSession = Depends(get_db_session),
) -> List[FlashcardResponse]:
    """Uses AI to extract key concepts and generate spaced-repetition flashcards."""
    # Find document
    stmt = select(Document).where(Document.id == document_id)
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    # Fetch chunks
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

    generated_data = await ai_service.generate_flashcards(
        chunks=chunks_data,
        document_title=doc.title,
        count=count,
        language=language,
    )

    saved_cards = []
    for item in generated_data:
        card = Flashcard(
            document_id=doc.id,
            front=item["front"],
            back=item["back"],
            source=item.get("source"),
            topic=item.get("topic", doc.title[:30]),
        )
        db.add(card)
        saved_cards.append(card)

    await db.commit()
    for card in saved_cards:
        await db.refresh(card)

    return [FlashcardResponse.model_validate(c) for c in saved_cards]
