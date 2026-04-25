from datetime import UTC, datetime, timedelta
import hashlib

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import require_current_user
from app.db.models import User
from app.db.session import get_db_session
from app.schemas.auth import MeResponse, TokenRequest, TokenResponse


router = APIRouter(prefix="/auth", tags=["auth"])


def _hash_password(raw_password: str) -> str:
    return hashlib.sha256(raw_password.encode("utf-8")).hexdigest()


def _create_token(payload: dict, expires_delta: timedelta) -> str:
    token_payload = {
        **payload,
        "exp": datetime.now(UTC) + expires_delta,
        "iat": datetime.now(UTC),
    }
    return jwt.encode(token_payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


@router.post("/token", response_model=TokenResponse)
def login(payload: TokenRequest, db: Session = Depends(get_db_session)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email, User.is_active.is_(True)))
    if not user or user.password_hash != _hash_password(payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password"},
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    refresh_token_expires = timedelta(days=7)
    token_base = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
    }
    return TokenResponse(
        access_token=_create_token({**token_base, "token_use": "access"}, access_token_expires),
        refresh_token=_create_token({**token_base, "token_use": "refresh"}, refresh_token_expires),
        expires_in=int(access_token_expires.total_seconds()),
    )


@router.get("/me", response_model=MeResponse)
def me(current_user: dict = Depends(require_current_user), db: Session = Depends(get_db_session)) -> MeResponse:
    user = db.scalar(select(User).where(User.id == current_user.get("sub")))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Authentication required"},
        )

    return MeResponse.model_validate(user)
