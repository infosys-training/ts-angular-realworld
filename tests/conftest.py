import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from incident_management.database import Base, get_db
from incident_management.main import app

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def sample_user(client):
    resp = client.post(
        "/api/users/",
        json={"username": "testuser", "email": "test@example.com", "full_name": "Test User"},
    )
    return resp.json()


@pytest.fixture()
def sample_incident(client):
    resp = client.post(
        "/api/incidents/",
        json={"title": "Test Incident", "description": "Test description", "priority": "high"},
    )
    return resp.json()
