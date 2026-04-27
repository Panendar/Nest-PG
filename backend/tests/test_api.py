from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from fastapi.testclient import TestClient

from app.core.config import settings
from app.db.base import Base
from app.db.models import PgListing, User
from app.db.seed import seed_minimum_data
from app.main import app


def _build_test_client(tmp_path, monkeypatch) -> TestClient:
    engine = create_engine(f"sqlite:///{tmp_path / 'test.db'}", connect_args={"check_same_thread": False})
    testing_session_local = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)
    Base.metadata.create_all(bind=engine)

    monkeypatch.setattr("app.db.session.SessionLocal", testing_session_local)
    monkeypatch.setattr("app.db.seed.SessionLocal", testing_session_local)
    seed_minimum_data()

    session = testing_session_local()
    try:
        owner = session.scalar(select(User).where(User.email == "owner-1@example.com"))
        if owner:
            session.add(
                PgListing(
                    id="inactive-listing-test",
                    owner_id=owner.id,
                    title="Archived PG - Test",
                    description="Archived listing used to verify unavailable detail handling.",
                    city="Hyderabad",
                    lat=17.45,
                    lng=78.39,
                    price=7000,
                    availability_status="full",
                    accepting_inquiries=False,
                    beds_available=1,
                    wifi_included=False,
                    meals_included=False,
                    furnished=False,
                    is_active=False,
                )
            )
            session.commit()
    finally:
        session.close()

    return TestClient(app)


def _token_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/v1/auth/token",
        json={"email": settings.default_user_email, "password": settings.default_user_password},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_login_returns_tokens(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)

    response = client.post(
        "/api/v1/auth/token",
        json={"email": settings.default_user_email, "password": settings.default_user_password},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["token_type"] == "bearer"
    assert payload["access_token"]
    assert payload["refresh_token"]
    assert payload["expires_in"] > 0


def test_login_rejects_invalid_password(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)

    response = client.post(
        "/api/v1/auth/token",
        json={"email": settings.default_user_email, "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["error"]["message"] == "Invalid email or password"


def test_me_returns_authenticated_user(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)
    headers = _token_headers(client)

    response = client.get("/api/v1/auth/me", headers=headers)

    assert response.status_code == 200
    payload = response.json()
    assert payload["email"] == settings.default_user_email
    assert payload["role"] == "user"
    assert payload["is_active"] is True


def test_city_search_returns_listings(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)
    headers = _token_headers(client)

    response = client.get("/api/v1/listings?city=Hyderabad&page=1&page_size=20", headers=headers)

    assert response.status_code == 200
    payload = response.json()
    assert payload["pagination"]["total"] >= 3
    assert all(item["city"] == "Hyderabad" for item in payload["items"])


def test_city_search_rejects_blank_city(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)
    headers = _token_headers(client)

    response = client.get("/api/v1/listings?city=&page=1&page_size=20", headers=headers)

    assert response.status_code == 400
    assert response.json()["error"]["message"] == "Please enter a city to search."


def test_nearby_search_returns_results(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)
    headers = _token_headers(client)

    response = client.get(
        "/api/v1/listings/nearby?lat=17.4425&lng=78.3498&radius_km=10&page=1&page_size=20",
        headers=headers,
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["pagination"]["total"] >= 2
    assert all(item["distance_km"] is not None for item in payload["items"])


def test_listing_details_return_410_for_inactive_listing(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)
    headers = _token_headers(client)

    response = client.get("/api/v1/listings/inactive-listing-test", headers=headers)

    assert response.status_code == 410
    assert response.json()["error"]["message"] == "This listing is no longer accepting inquiries. You can browse other options."


def test_listing_detail_and_compare_work(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)
    headers = _token_headers(client)

    search_response = client.get("/api/v1/listings?city=Hyderabad&page=1&page_size=20", headers=headers)
    items = search_response.json()["items"]
    first_id = items[0]["id"]
    second_id = items[1]["id"]

    detail_response = client.get(f"/api/v1/listings/{first_id}", headers=headers)
    assert detail_response.status_code == 200
    assert detail_response.json()["id"] == first_id

    compare_response = client.get(f"/api/v1/listings/compare?ids={first_id},{second_id}", headers=headers)
    assert compare_response.status_code == 200
    assert len(compare_response.json()["items"]) == 2


def test_compare_requires_two_listings(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)
    headers = _token_headers(client)

    response = client.get("/api/v1/listings/compare?ids=only-one-id", headers=headers)

    assert response.status_code == 422
    assert response.json()["error"]["message"] == "Please select at least two listings to compare."


def test_contact_create_and_status_flow(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)
    headers = _token_headers(client)

    listing_search = client.get("/api/v1/listings?city=Hyderabad&page=1&page_size=20", headers=headers)
    listing_id = listing_search.json()["items"][0]["id"]

    create_response = client.post(
        "/api/v1/contacts",
        json={
            "listing_id": listing_id,
            "full_name": "Test User",
            "phone_number": "+91 9876543210",
            "preferred_move_in_date": None,
            "message": "I am interested in this listing and would like to visit.",
        },
        headers=headers,
    )

    assert create_response.status_code == 201
    payload = create_response.json()
    assert payload["listing_id"] == listing_id
    assert payload["status"] == "confirmed"

    status_response = client.get(f"/api/v1/contacts/{payload['id']}", headers=headers)
    assert status_response.status_code == 200
    status_payload = status_response.json()
    assert status_payload["id"] == payload["id"]
    assert status_payload["listing_id"] == listing_id
    assert status_payload["status"] in {"open", "closed"}


def test_contact_rejects_duplicate_recent_inquiry(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)
    headers = _token_headers(client)

    listing_search = client.get("/api/v1/listings?city=Hyderabad&page=1&page_size=20", headers=headers)
    listing_id = listing_search.json()["items"][0]["id"]

    payload = {
        "listing_id": listing_id,
        "full_name": "Test User",
        "phone_number": "+91 9876543210",
        "preferred_move_in_date": None,
        "message": "I am interested in this listing and would like to visit.",
    }
    first_response = client.post("/api/v1/contacts", json=payload, headers=headers)
    assert first_response.status_code == 201

    duplicate_response = client.post("/api/v1/contacts", json=payload, headers=headers)
    assert duplicate_response.status_code == 409
    assert duplicate_response.json()["error"]["message"] == "You have already sent an inquiry recently. Please wait before trying again."


def test_saved_listings_create_list_delete(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)
    headers = _token_headers(client)

    listing_search = client.get("/api/v1/listings?city=Hyderabad&page=1&page_size=20", headers=headers)
    listing_id = listing_search.json()["items"][0]["id"]

    create_response = client.post("/api/v1/saved-listings", json={"listing_id": listing_id}, headers=headers)
    assert create_response.status_code == 201
    saved_id = create_response.json()["id"]

    list_response = client.get("/api/v1/saved-listings?page=1&page_size=20", headers=headers)
    assert list_response.status_code == 200
    listed_ids = [item["id"] for item in list_response.json()["items"]]
    assert saved_id in listed_ids

    duplicate_response = client.post("/api/v1/saved-listings", json={"listing_id": listing_id}, headers=headers)
    assert duplicate_response.status_code == 409

    delete_response = client.delete(f"/api/v1/saved-listings/{saved_id}", headers=headers)
    assert delete_response.status_code == 204


def test_recent_searches_create_list_get_context_delete(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)
    headers = _token_headers(client)

    create_response = client.post(
        "/api/v1/recent-searches",
        json={
            "city": "Hyderabad",
            "radius_km": 5,
            "filters": {"availability": "available", "price_min": 5000, "price_max": 12000},
            "sort": "relevance",
        },
        headers=headers,
    )
    assert create_response.status_code == 201
    search_id = create_response.json()["id"]

    list_response = client.get("/api/v1/recent-searches?page=1&page_size=20", headers=headers)
    assert list_response.status_code == 200
    assert any(item["id"] == search_id for item in list_response.json()["items"])

    context_response = client.get(f"/api/v1/searches/{search_id}", headers=headers)
    assert context_response.status_code == 200
    context_payload = context_response.json()
    assert context_payload["id"] == search_id
    assert context_payload["city"] == "Hyderabad"
    assert context_payload["radius_km"] == 5

    delete_response = client.delete(f"/api/v1/recent-searches/{search_id}", headers=headers)
    assert delete_response.status_code == 204


def test_recent_searches_reject_empty_payload(tmp_path, monkeypatch):
    client = _build_test_client(tmp_path, monkeypatch)
    headers = _token_headers(client)

    response = client.post(
        "/api/v1/recent-searches",
        json={"city": None, "radius_km": None, "filters": None, "sort": None},
        headers=headers,
    )

    assert response.status_code == 400
    assert response.json()["error"]["message"] == "We could not restore this search. Please try again."
