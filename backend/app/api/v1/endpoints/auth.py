"""Authentication Endpoints (Registration, Login, Current User)."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.models.user import User, UserProfile
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter()
security_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db_session),
) -> User:
    """Dependency to retrieve the currently authenticated user from Bearer JWT."""
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(auth.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(payload["sub"])
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token subject",
        )

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account no longer exists",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive",
        )

    return user


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student account",
)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    """Creates a new user account and associated profile, returning a session token."""
    # Check if email is already taken
    stmt = select(User).where(User.email == user_in.email.lower().strip())
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # Create new User
    new_user = User(
        email=user_in.email.lower().strip(),
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name.strip(),
        role="student",
        is_active=True,
    )
    db.add(new_user)
    await db.flush()  # Populates new_user.id

    # Create User Profile with preferences
    new_profile = UserProfile(
        user_id=new_user.id,
        interface_language=user_in.interface_language or "en",
        ai_response_language=user_in.ai_response_language or "en",
        university=user_in.university.strip() if user_in.university else None,
        department=user_in.department.strip() if user_in.department else None,
        academic_year=user_in.academic_year,
    )
    db.add(new_profile)
    await db.commit()

    # Re-fetch user with profile relation
    stmt = select(User).where(User.id == new_user.id)
    user_with_profile = (await db.execute(stmt)).scalar_one()

    # Generate JWT access token
    access_token = create_access_token(
        subject=user_with_profile.id,
        extra_claims={
            "email": user_with_profile.email,
            "role": user_with_profile.role,
        },
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user_with_profile),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and obtain session token",
)
async def login(
    login_in: LoginRequest,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    """Authenticates email and password, returning a JWT token on success."""
    stmt = select(User).where(User.email == login_in.email.lower().strip())
    user = (await db.execute(stmt)).scalar_one_or_none()

    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This student account has been deactivated.",
        )

    access_token = create_access_token(
        subject=user.id,
        extra_claims={
            "email": user.email,
            "role": user.role,
        },
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Returns the authenticated student's profile information."""
    return UserResponse.model_validate(current_user)
