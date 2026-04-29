from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health", summary="Health check")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/error-test", summary="Error handler smoke test")
def error_test() -> None:
    raise RuntimeError("forced test error")
