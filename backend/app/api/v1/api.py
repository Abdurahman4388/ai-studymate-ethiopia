"""API v1 Router Aggregator."""

from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, materials, chat, flashcards, quizzes

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health & Monitoring"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Accounts"])
api_router.include_router(materials.router, prefix="/materials", tags=["Course Materials & Documents"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Study Tutor & RAG Chat"])
api_router.include_router(flashcards.router, prefix="/flashcards", tags=["Spaced Repetition Flashcards"])
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["Practice Exams & National Exit Exam"])
