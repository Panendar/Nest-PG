"""Add owner listing management fields

Revision ID: 004_owner_listing_fields
Revises: 003_contacts_saved_recent
Create Date: 2026-05-03 18:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "004_owner_listing_fields"
down_revision = "003_contacts_saved_recent"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("pg_listings", sa.Column("pg_name", sa.String(length=120), nullable=True))
    op.add_column("pg_listings", sa.Column("area", sa.String(length=120), nullable=True))
    op.add_column("pg_listings", sa.Column("monthly_rent", sa.Integer(), nullable=True))
    op.add_column("pg_listings", sa.Column("occupancy_type", sa.String(length=40), nullable=True))
    op.add_column("pg_listings", sa.Column("available_units", sa.Integer(), nullable=True))
    op.add_column("pg_listings", sa.Column("amenities_json", sa.Text(), nullable=True))
    op.add_column("pg_listings", sa.Column("listing_status", sa.String(length=20), nullable=False, server_default="active"))
    op.add_column("pg_listings", sa.Column("availability_note", sa.String(length=200), nullable=True))
    op.add_column("pg_listings", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index(op.f("ix_pg_listings_listing_status"), "pg_listings", ["listing_status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_pg_listings_listing_status"), table_name="pg_listings")
    op.drop_column("pg_listings", "deleted_at")
    op.drop_column("pg_listings", "availability_note")
    op.drop_column("pg_listings", "listing_status")
    op.drop_column("pg_listings", "amenities_json")
    op.drop_column("pg_listings", "available_units")
    op.drop_column("pg_listings", "occupancy_type")
    op.drop_column("pg_listings", "monthly_rent")
    op.drop_column("pg_listings", "area")
    op.drop_column("pg_listings", "pg_name")
