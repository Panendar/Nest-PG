from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.contacts import router as contacts_router
from app.api.routes.listings import router as listings_router
from app.api.routes.recent_searches import router as recent_searches_router
from app.api.routes.saved_listings import router as saved_listings_router
from app.api.routes.searches import router as searches_router
from app.api.routes.health import router as health_router
from app.api.routes.protected import router as protected_router
from app.core.config import settings
from app.core.errors import register_error_handlers
from app.core.security import JWTAuthMiddleware
from app.db.base import Base
from app.db.seed import seed_minimum_data
from app.db.session import engine

app = FastAPI(title=settings.app_name)

app.middleware("http")(
	JWTAuthMiddleware(
		protected_prefixes=(
			f"{settings.api_prefix}/protected",
			f"{settings.api_prefix}/admin",
			f"{settings.api_prefix}/auth/me",
			f"{settings.api_prefix}/listings",
			f"{settings.api_prefix}/contacts",
			f"{settings.api_prefix}/saved-listings",
			f"{settings.api_prefix}/recent-searches",
			f"{settings.api_prefix}/searches",
		)
	)
)

app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.cors_origins,
	allow_credentials=False,
	allow_methods=["*"],
	allow_headers=["*"],
)
register_error_handlers(app)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    seed_minimum_data()

app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(listings_router, prefix=settings.api_prefix)
app.include_router(contacts_router, prefix=settings.api_prefix)
app.include_router(saved_listings_router, prefix=settings.api_prefix)
app.include_router(recent_searches_router, prefix=settings.api_prefix)
app.include_router(searches_router, prefix=settings.api_prefix)
app.include_router(protected_router, prefix=settings.api_prefix)
