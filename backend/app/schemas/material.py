"""Pydantic schemas for Materials, Flashcards, Quizzes, and Chat."""

import uuid
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentBase(BaseModel):
    title: str
    filename: str
    file_type: str
    page_count: int
    file_size_bytes: int
    status: str


class DocumentResponse(DocumentBase):
    id: uuid.UUID
    created_at: datetime
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class FlashcardBase(BaseModel):
    front: str
    back: str
    source: Optional[str] = None
    topic: Optional[str] = None


class FlashcardCreate(FlashcardBase):
    document_id: Optional[uuid.UUID] = None


class FlashcardResponse(FlashcardBase):
    id: uuid.UUID
    document_id: Optional[uuid.UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuizQuestionBase(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str
    source_citation: Optional[str] = None
    category: str = "Course Material"


class QuizQuestionResponse(BaseModel):
    id: uuid.UUID
    document_id: Optional[uuid.UUID] = None
    category: str
    question: str
    options: List[str]
    correct_index: int
    explanation: str
    source_citation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ChatQueryRequest(BaseModel):
    query: str
    document_id: Optional[uuid.UUID] = None
    language: Optional[str] = "en"  # "en", "am", "om"


class ChatQueryResponse(BaseModel):
    answer: str
    citation: Optional[str] = None
    source_pages: List[int] = []
    language: str = "en"
