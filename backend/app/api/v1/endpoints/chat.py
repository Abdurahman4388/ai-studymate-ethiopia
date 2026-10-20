"""AI Study Chat with RAG Grounded Citations."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
from app.models.material import Document, DocumentChunk
from app.schemas.material import ChatQueryRequest, ChatQueryResponse
from app.services.ai_service import ai_service

router = APIRouter()


@router.post(
    "/query",
    response_model=ChatQueryResponse,
    summary="Ask a question grounded in course notes",
)
async def query_study_assistant(
    request: ChatQueryRequest,
    db: AsyncSession = Depends(get_db_session),
) -> ChatQueryResponse:
    """Answers student queries with exact page citations from uploaded documents."""
    query = request.query.strip()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty.",
        )

    chunks_data = []
    doc_title = "Uploaded Course Material"

    if request.document_id:
        # Fetch document
        stmt = select(Document).where(Document.id == request.document_id)
        doc = (await db.execute(stmt)).scalar_one_or_none()
        if doc:
            doc_title = doc.title
            # Fetch chunks for this document
            chunk_stmt = select(DocumentChunk).where(DocumentChunk.document_id == request.document_id)
            db_chunks = (await db.execute(chunk_stmt)).scalars().all()
            chunks_data = [
                {"page_number": c.page_number, "content": c.content, "chunk_index": c.chunk_index}
                for c in db_chunks
            ]
    else:
        # Fetch chunks from any recent documents
        chunk_stmt = select(DocumentChunk).limit(100)
        db_chunks = (await db.execute(chunk_stmt)).scalars().all()
        chunks_data = [
            {"page_number": c.page_number, "content": c.content, "chunk_index": c.chunk_index}
            for c in db_chunks
        ]

    # Generate answer with RAG citations
    result = await ai_service.answer_query_with_rag(
        query=query,
        chunks=chunks_data,
        document_title=doc_title,
        language=request.language or "en",
    )

    return ChatQueryResponse(
        answer=result["answer"],
        citation=result.get("citation"),
        source_pages=result.get("source_pages", []),
        language=result.get("language", request.language or "en"),
    )
