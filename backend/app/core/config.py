from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "My_PG API"
    environment: str = "development"
    api_prefix: str = "/api/v1"

    database_url: str = "sqlite:///./app.db"
    database_echo: bool = False
    database_pool_pre_ping: bool = True

    cors_allow_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"

    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    default_user_email: str = "user@example.com"
    default_user_password: str = "change-me"
    default_admin_email: str = "admin@example.com"
    default_admin_password: str = "change-me"
    default_owner_email: str = "owner@example.com"
    default_owner_password: str = "change-me"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_allow_origins.split(",") if origin.strip()]


settings = Settings()
