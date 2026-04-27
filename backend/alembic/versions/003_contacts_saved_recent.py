"""Add contacts, saved listings, and recent searches tables

Revision ID: 003_contacts_saved_recent
Revises: 002_pg_listings
Create Date: 2026-04-27 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "003_contacts_saved_recent"
down_revision = "002_pg_listings"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "contacts",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("owner_id", sa.String(), nullable=False),
        sa.Column("listing_id", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(length=80), nullable=False),
        sa.Column("phone_number", sa.String(length=32), nullable=False),
        sa.Column("preferred_move_in_date", sa.Date(), nullable=True),
        sa.Column("message", sa.String(length=500), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["listing_id"], ["pg_listings.id"]),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_contacts_listing_id"), "contacts", ["listing_id"], unique=False)
    op.create_index(op.f("ix_contacts_owner_id"), "contacts", ["owner_id"], unique=False)
    op.create_index(op.f("ix_contacts_user_id"), "contacts", ["user_id"], unique=False)

    op.create_table(
        "saved_listings",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("listing_id", sa.String(), nullable=False),
        sa.Column("saved_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["listing_id"], ["pg_listings.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "listing_id", name="uq_saved_listings_user_listing"),
    )
    op.create_index(op.f("ix_saved_listings_listing_id"), "saved_listings", ["listing_id"], unique=False)
    op.create_index(op.f("ix_saved_listings_user_id"), "saved_listings", ["user_id"], unique=False)

    op.create_table(
        "recent_searches",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("radius_km", sa.Integer(), nullable=True),
        sa.Column("filters_json", sa.Text(), nullable=True),
        sa.Column("sort", sa.String(length=50), nullable=True),
        sa.Column("context_key", sa.String(length=200), nullable=False),
        sa.Column("searched_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_recent_searches_context_key"), "recent_searches", ["context_key"], unique=False)
    op.create_index(op.f("ix_recent_searches_searched_at"), "recent_searches", ["searched_at"], unique=False)
    op.create_index(op.f("ix_recent_searches_user_id"), "recent_searches", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_recent_searches_user_id"), table_name="recent_searches")
    op.drop_index(op.f("ix_recent_searches_searched_at"), table_name="recent_searches")
    op.drop_index(op.f("ix_recent_searches_context_key"), table_name="recent_searches")
    op.drop_table("recent_searches")

    op.drop_index(op.f("ix_saved_listings_user_id"), table_name="saved_listings")
    op.drop_index(op.f("ix_saved_listings_listing_id"), table_name="saved_listings")
    op.drop_table("saved_listings")

    op.drop_index(op.f("ix_contacts_user_id"), table_name="contacts")
    op.drop_index(op.f("ix_contacts_owner_id"), table_name="contacts")
    op.drop_index(op.f("ix_contacts_listing_id"), table_name="contacts")
    op.drop_table("contacts")
