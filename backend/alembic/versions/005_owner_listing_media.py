"""Add listing media table

Revision ID: 005_owner_listing_media
Revises: 004_owner_listing_fields
Create Date: 2026-05-03 19:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "005_owner_listing_media"
down_revision = "004_owner_listing_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "listing_media",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("listing_id", sa.String(), nullable=False),
        sa.Column("storage_key", sa.String(length=500), nullable=False),
        sa.Column("file_url", sa.String(length=500), nullable=False),
        sa.Column("caption", sa.String(length=200), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["listing_id"], ["pg_listings.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_listing_media_listing_id"), "listing_media", ["listing_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_listing_media_listing_id"), table_name="listing_media")
    op.drop_table("listing_media")
