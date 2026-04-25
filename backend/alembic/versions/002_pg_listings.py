"""Add PG listings table

Revision ID: 002_pg_listings
Revises: 001_initial
Create Date: 2026-04-25 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "002_pg_listings"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "pg_listings",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("owner_id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("city", sa.String(), nullable=False),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lng", sa.Float(), nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("availability_status", sa.String(), nullable=False),
        sa.Column("accepting_inquiries", sa.Boolean(), nullable=False),
        sa.Column("beds_available", sa.Integer(), nullable=False),
        sa.Column("wifi_included", sa.Boolean(), nullable=False),
        sa.Column("meals_included", sa.Boolean(), nullable=False),
        sa.Column("furnished", sa.Boolean(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_pg_listings_owner_id"), "pg_listings", ["owner_id"], unique=False)
    op.create_index(op.f("ix_pg_listings_city"), "pg_listings", ["city"], unique=False)
    op.create_index(op.f("ix_pg_listings_availability_status"), "pg_listings", ["availability_status"], unique=False)
    op.create_index(op.f("ix_pg_listings_is_active"), "pg_listings", ["is_active"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_pg_listings_is_active"), table_name="pg_listings")
    op.drop_index(op.f("ix_pg_listings_availability_status"), table_name="pg_listings")
    op.drop_index(op.f("ix_pg_listings_city"), table_name="pg_listings")
    op.drop_index(op.f("ix_pg_listings_owner_id"), table_name="pg_listings")
    op.drop_table("pg_listings")