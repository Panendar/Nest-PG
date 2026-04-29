import hashlib
import uuid

from sqlalchemy import select

from app.core.config import settings
from app.db.models import PgListing, Role, User
from app.db.session import SessionLocal


def _hash_password(raw_password: str) -> str:
    return hashlib.sha256(raw_password.encode("utf-8")).hexdigest()


def _stable_uuid(name: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"my-pg-user::{name}"))


def _ensure_user(db, email: str, password: str, role: str) -> User:
    existing_user = db.scalar(select(User).where(User.email == email))
    if existing_user:
        existing_user.password_hash = _hash_password(password)
        existing_user.role = role
        existing_user.is_active = True
        return existing_user

    user = User(
        id=_stable_uuid(email),
        email=email,
        password_hash=_hash_password(password),
        role=role,
        is_active=True,
    )
    db.add(user)
    return user


def _ensure_listing(db, **listing_data) -> None:
    existing_listing = db.scalar(select(PgListing).where(PgListing.id == listing_data["id"]))
    if existing_listing:
        return
    db.add(PgListing(**listing_data))


def seed_minimum_data() -> None:
    db = SessionLocal()
    try:
        for role_name in ("admin", "user"):
            existing_role = db.scalar(select(Role).where(Role.name == role_name))
            if not existing_role:
                db.add(Role(id=str(uuid.uuid4()), name=role_name))

        _ensure_user(db, settings.default_user_email, settings.default_user_password, "user")
        _ensure_user(db, settings.default_admin_email, settings.default_admin_password, "admin")

        owner_one = _ensure_user(db, "owner-1@example.com", "change-me", "user")
        owner_two = _ensure_user(db, "owner-2@example.com", "change-me", "user")
        owner_three = _ensure_user(db, "owner-3@example.com", "change-me", "user")
        owner_four = _ensure_user(db, "owner-4@example.com", "change-me", "user")
        owner_five = _ensure_user(db, "owner-5@example.com", "change-me", "user")

        _ensure_listing(
            db,
            id=_stable_uuid("listing-sri-lakshmi-madhapur"),
            owner_id=owner_one.id,
            title="Sri Lakshmi PG - Madhapur",
            description="Bright rooms close to Hitec City with weekday meals, Wi-Fi, and flexible stay options.",
            city="Hyderabad",
            lat=17.4484,
            lng=78.3915,
            price=8500,
            availability_status="available",
            accepting_inquiries=True,
            beds_available=2,
            wifi_included=True,
            meals_included=True,
            furnished=True,
            is_active=True,
        )
        _ensure_listing(
            db,
            id=_stable_uuid("listing-green-nest-gachibowli"),
            owner_id=owner_two.id,
            title="Green Nest PG - Gachibowli",
            description="Quiet PG with power backup, laundry access, and quick access to offices.",
            city="Hyderabad",
            lat=17.4459,
            lng=78.3592,
            price=9200,
            availability_status="limited",
            accepting_inquiries=True,
            beds_available=1,
            wifi_included=True,
            meals_included=True,
            furnished=True,
            is_active=True,
        )
        _ensure_listing(
            db,
            id=_stable_uuid("listing-sai-comfort-kondapur"),
            owner_id=owner_three.id,
            title="Sai Comfort PG - Kondapur",
            description="Affordable option with shared kitchen, daily housekeeping, and visitor-friendly rules.",
            city="Hyderabad",
            lat=17.4696,
            lng=78.3652,
            price=8900,
            availability_status="full",
            accepting_inquiries=False,
            beds_available=3,
            wifi_included=True,
            meals_included=True,
            furnished=False,
            is_active=True,
        )
        _ensure_listing(
            db,
            id=_stable_uuid("listing-city-heaven-bengaluru"),
            owner_id=owner_four.id,
            title="City Heaven PG - Indiranagar",
            description="Female-friendly PG with metro access, terrace seating, and premium rooms.",
            city="Bengaluru",
            lat=12.9719,
            lng=77.6412,
            price=11200,
            availability_status="available",
            accepting_inquiries=True,
            beds_available=2,
            wifi_included=True,
            meals_included=False,
            furnished=True,
            is_active=True,
        )
        _ensure_listing(
            db,
            id=_stable_uuid("listing-pune-nova-kharadi"),
            owner_id=owner_five.id,
            title="Nova Stay PG - Kharadi",
            description="Work-ready PG with study desks, power backup, and easy commute to tech parks.",
            city="Pune",
            lat=18.5519,
            lng=73.9502,
            price=7600,
            availability_status="available",
            accepting_inquiries=True,
            beds_available=4,
            wifi_included=True,
            meals_included=False,
            furnished=True,
            is_active=True,
        )

        db.commit()
        print("Seed completed successfully")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_minimum_data()
