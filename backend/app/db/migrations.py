from alembic import command
from alembic.config import Config


def get_alembic_config() -> Config:
    config = Config("alembic.ini")
    return config


def run_migrations() -> None:
    command.upgrade(get_alembic_config(), "head")
