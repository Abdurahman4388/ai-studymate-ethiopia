"""AI StudyMate Ethiopia - Backend Application Package."""

import os

# Ensure pure-Python execution for SQLAlchemy on Windows systems with Application Control
os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")

__version__ = "0.1.0"
