"""Course Materials Endpoints (Upload, List, Get, Delete)."""

import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db_session
from app.models.material import Document, DocumentChunk
from app.schemas.material import DocumentResponse
from app.services.document_parser import extract_document_pages, chunk_document_pages

router = APIRouter()


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and parse a course document",
)
async def upload_material(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db_session),
) -> DocumentResponse:
    """Uploads a course file (PDF, DOCX, PPTX), parses text pages, and builds chunks for RAG."""
    # Validate extension
    filename = file.filename or "uploaded_document"
    ext = os.path.splitext(filename)[1].lower().replace(".", "")
    if ext not in ["pdf", "docx", "doc", "pptx", "ppt", "txt", "md"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format: .{ext}. Allowed: PDF, DOCX, PPTX, TXT.",
        )

    # Ensure storage directory exists
    storage_dir = os.path.abspath(settings.LOCAL_STORAGE_PATH)
    os.makedirs(storage_dir, exist_ok=True)

    file_uuid = uuid.uuid4()
    saved_filename = f"{file_uuid}_{filename}"
    saved_path = os.path.join(storage_dir, saved_filename)

    # Save to disk
    file_size = 0
    try:
        with open(saved_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                file_size += len(chunk)
                buffer.write(chunk)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}",
        )

    # Parse document pages
    try:
        pages_data = extract_document_pages(saved_path, ext)
        page_count = len(pages_data) if pages_data else 1
        chunks_data = chunk_document_pages(pages_data)

        # Create Document record
        doc = Document(
            id=file_uuid,
            title=filename,
            filename=filename,
            file_path=saved_path,
            file_size_bytes=file_size,
            file_type=ext,
            page_count=page_count,
            status="READY",
        )
        db.add(doc)
        await db.flush()

        # Add chunks
        for item in chunks_data:
            chunk = DocumentChunk(
                document_id=doc.id,
                chunk_index=item["chunk_index"],
                page_number=item["page_number"],
                content=item["content"],
            )
            db.add(chunk)

        await db.commit()
        await db.refresh(doc)
        return DocumentResponse.model_validate(doc)

    except Exception as e:
        # If parsing failed, record with ERROR status
        doc = Document(
            id=file_uuid,
            title=filename,
            filename=filename,
            file_path=saved_path,
            file_size_bytes=file_size,
            file_type=ext,
            page_count=1,
            status="ERROR",
            error_message=str(e),
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)
        return DocumentResponse.model_validate(doc)


@router.get(
    "/",
    response_model=List[DocumentResponse],
    summary="List all uploaded course documents",
)
async def list_materials(
    db: AsyncSession = Depends(get_db_session),
) -> List[DocumentResponse]:
    """Retrieves all course materials available for study."""
    stmt = select(Document).order_by(Document.created_at.desc())
    result = await db.execute(stmt)
    docs = result.scalars().all()
    return [DocumentResponse.model_validate(d) for d in docs]


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Get details of a specific document",
)
async def get_material(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
) -> DocumentResponse:
    """Retrieves a single course material by ID."""
    stmt = select(Document).where(Document.id == document_id)
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return DocumentResponse.model_validate(doc)


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a course document and its chunks",
)
async def delete_material(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
):
    """Deletes a document and its stored file from the system."""
    stmt = select(Document).where(Document.id == document_id)
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    # Remove physical file
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    await db.delete(doc)
    await db.commit()
    return None
