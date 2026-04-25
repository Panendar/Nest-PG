from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.listings import router as listings_router
from app.api.routes.health import router as health_router
from app.api.routes.protected import router as protected_router
from app.core.config import settings
from app.core.errors import register_error_handlers
from app.core.security import JWTAuthMiddleware

app = FastAPI(title=settings.app_name)

app.middleware("http")(
	JWTAuthMiddleware(
		protected_prefixes=(
			f"{settings.api_prefix}/protected",
			f"{settings.api_prefix}/admin",
			f"{settings.api_prefix}/auth/me",
			f"{settings.api_prefix}/listings",
		)
	)
)
register_error_handlers(app)

app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(listings_router, prefix=settings.api_prefix)
app.include_router(protected_router, prefix=settings.api_prefix)
