from fastapi import APIRouter, Depends, Request

from app.core.security import require_current_user, require_roles

router = APIRouter(prefix="/protected", tags=["protected"])


@router.get("/me")
def get_me(request: Request, _current_user: dict = Depends(require_current_user)) -> dict:
    return {"user": request.state.user}


@router.get("/admin/ping")
def admin_ping(_admin_user: dict = Depends(require_roles(["admin"]))) -> dict[str, str]:
    return {"status": "admin-ok"}
