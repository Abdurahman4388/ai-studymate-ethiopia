"""API Schemas Package."""

from .health import HealthResponse, DatabaseHealth, StorageHealth
from .user import UserBase, UserCreate, UserResponse, UserProfileBase, UserProfileResponse
from .auth import LoginRequest, TokenResponse
from .material import (
    DocumentBase,
    DocumentResponse,
    FlashcardBase,
    FlashcardCreate,
    FlashcardResponse,
    QuizQuestionBase,
    QuizQuestionResponse,
    ChatQueryRequest,
    ChatQueryResponse,
)

__all__ = [
    "HealthResponse",
    "DatabaseHealth",
    "StorageHealth",
    "UserBase",
    "UserCreate",
    "UserResponse",
    "UserProfileBase",
    "UserProfileResponse",
    "LoginRequest",
    "TokenResponse",
    "DocumentBase",
    "DocumentResponse",
    "FlashcardBase",
    "FlashcardCreate",
    "FlashcardResponse",
    "QuizQuestionBase",
    "QuizQuestionResponse",
    "ChatQueryRequest",
    "ChatQueryResponse",
]
