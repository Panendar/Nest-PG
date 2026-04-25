from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "My_PG User API"
    environment: str = "development"
    api_prefix: str = "/api/v1"

    database_url: str = "sqlite:///./app.db"

    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    default_user_email: str = "user@example.com"
    default_user_password: str = "change-me"
    default_admin_email: str = "admin@example.com"
    default_admin_password: str = "change-me"


settings = Settings()
