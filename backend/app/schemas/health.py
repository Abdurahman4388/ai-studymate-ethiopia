"""Health Check schemas for system monitoring."""

from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class DatabaseHealth(BaseModel):
    connected: bool
    latency_ms: Optional[float] = None
    error: Optional[str] = None


class StorageHealth(BaseModel):
    storage_type: str
    target_path: str
    accessible: bool


class HealthResponse(BaseModel):
    status: str = Field(default="online", description="Overall health state")
    project_name: str
    version: str
    environment: str
    timestamp: datetime
    database: DatabaseHealth
    storage: StorageHealth
    supported_languages: List[str] = Field(default=["en", "am", "om"])
    ai_provider: str
