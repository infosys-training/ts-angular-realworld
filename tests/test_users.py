def test_create_user(client):
    resp = client.post(
        "/api/users/",
        json={"username": "john", "email": "john@example.com", "full_name": "John Doe"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "john"
    assert data["email"] == "john@example.com"
    assert data["full_name"] == "John Doe"
    assert "id" in data


def test_create_user_duplicate_username(client, sample_user):
    resp = client.post(
        "/api/users/",
        json={"username": "testuser", "email": "other@example.com", "full_name": "Other"},
    )
    assert resp.status_code == 400
    assert "already exists" in resp.json()["detail"]


def test_create_user_duplicate_email(client, sample_user):
    resp = client.post(
        "/api/users/",
        json={"username": "other", "email": "test@example.com", "full_name": "Other"},
    )
    assert resp.status_code == 400


def test_list_users(client, sample_user):
    resp = client.get("/api/users/")
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_get_user(client, sample_user):
    resp = client.get(f"/api/users/{sample_user['id']}")
    assert resp.status_code == 200
    assert resp.json()["username"] == "testuser"


def test_get_user_not_found(client):
    resp = client.get("/api/users/9999")
    assert resp.status_code == 404
