import logging
import uuid
from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("my_pg.user.api")


def error_body(code: str, message: str, request_id: str, details: Any | None = None) -> dict[str, Any]:
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details or [],
            "request_id": request_id,
        }
    }


def _request_id(request: Request) -> str:
    existing = request.headers.get("x-request-id")
    return existing if existing else str(uuid.uuid4())


def _user_id_from_request(request: Request) -> str | None:
    user = getattr(request.state, "user", None)
    if isinstance(user, dict):
        return user.get("sub")
    return None


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        request_id = _request_id(request)
        payload = exc.detail if isinstance(exc.detail, dict) else {"code": "HTTP_ERROR", "message": str(exc.detail)}
        logger.warning(
            "Handled HTTP error",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "user_id": _user_id_from_request(request),
                "status": exc.status_code,
                "error_code": payload.get("code", "HTTP_ERROR"),
            },
        )

        return JSONResponse(
            status_code=exc.status_code,
            content=error_body(
                code=payload.get("code", "HTTP_ERROR"),
                message=payload.get("message", "Request failed"),
                details=payload.get("details", []),
                request_id=request_id,
            ),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        request_id = _request_id(request)
        details = []
        for issue in exc.errors():
            field_path = ".".join(str(part) for part in issue.get("loc", []) if part != "body")
            details.append(
                {
                    "field": field_path or "request",
                    "message": issue.get("msg", "Invalid value"),
                }
            )
        logger.info(
            "Validation error",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "user_id": _user_id_from_request(request),
                "errors": exc.errors(),
            },
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_body(
                code="VALIDATION_ERROR",
                message="Request validation failed",
                request_id=request_id,
                details=details,
            ),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = _request_id(request)

        logger.exception(
            "Unhandled server exception",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "user_id": _user_id_from_request(request),
            },
        )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_body(
                code="internal_error",
                message="Unexpected server error",
                request_id=request_id,
            ),
        )
