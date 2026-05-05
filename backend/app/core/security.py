from collections.abc import Sequence
import uuid

from fastapi import Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_prefix}/auth/login")


def _unauthorized(message: str = "Authentication required") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"code": "UNAUTHORIZED", "message": message},
    )


def _forbidden(message: str = "Insufficient role") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={"code": "FORBIDDEN", "message": message},
    )


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise _unauthorized("Invalid or expired token") from exc

    if not isinstance(payload, dict) or "sub" not in payload:
        raise _unauthorized("Invalid token payload")

    return payload


def require_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    return decode_token(token)


def require_roles(required_roles: Sequence[str]):
    required = {role.strip().lower() for role in required_roles}

    def dependency(user: dict = Depends(require_current_user)) -> dict:
        role = str(user.get("role", "")).strip().lower()
        # Allow exact match
        if role in required:
            return user
        # Role hierarchy: owners and admins can act as users
        if "user" in required and role in {"owner", "admin"}:
            return user
        # Admins can act as owners for owner-scoped endpoints
        if "owner" in required and role == "admin":
            return user
        raise _forbidden()

    return dependency


def _auth_error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "details": [],
                "request_id": str(uuid.uuid4()),
            }
        },
    )


class JWTAuthMiddleware:
    def __init__(self, protected_prefixes: Sequence[str], role_prefixes: dict[str, Sequence[str]] | None = None):
        self.protected_prefixes = tuple(protected_prefixes)
        self.role_prefixes = {
            prefix: tuple(role.strip().lower() for role in roles)
            for prefix, roles in (role_prefixes or {}).items()
        }

    async def __call__(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        request.state.user = None

        needs_auth = request.url.path.startswith(self.protected_prefixes)
        if needs_auth:
            auth_header = request.headers.get("authorization")
            if not auth_header or not auth_header.lower().startswith("bearer "):
                return _auth_error_response(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED", "Missing bearer token")

            token = auth_header.split(" ", 1)[1].strip()
            try:
                user = decode_token(token)
            except HTTPException as exc:
                detail = exc.detail if isinstance(exc.detail, dict) else {}
                return _auth_error_response(
                    exc.status_code,
                    str(detail.get("code", "UNAUTHORIZED")),
                    str(detail.get("message", "Invalid or expired token")),
                )

            request.state.user = user

            normalized_role = str(user.get("role", "")).strip().lower()
            for prefix, allowed_roles in self.role_prefixes.items():
                if request.url.path.startswith(prefix) and normalized_role not in allowed_roles:
                    return _auth_error_response(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "Insufficient role")

        response = await call_next(request)
        return response
