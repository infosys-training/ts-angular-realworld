def test_create_incident(client):
    resp = client.post(
        "/api/incidents/",
        json={"title": "Server Down", "description": "Prod is down", "priority": "critical"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Server Down"
    assert data["status"] == "open"
    assert data["priority"] == "critical"
    assert data["assignee"] is None


def test_create_incident_with_assignee(client, sample_user):
    resp = client.post(
        "/api/incidents/",
        json={"title": "Bug", "priority": "medium", "assignee_id": sample_user["id"]},
    )
    assert resp.status_code == 201
    assert resp.json()["assignee_id"] == sample_user["id"]
    assert resp.json()["assignee"]["username"] == "testuser"


def test_create_incident_invalid_assignee(client):
    resp = client.post(
        "/api/incidents/",
        json={"title": "Bug", "assignee_id": 9999},
    )
    assert resp.status_code == 404
    assert "Assignee not found" in resp.json()["detail"]


def test_get_incident(client, sample_incident):
    resp = client.get(f"/api/incidents/{sample_incident['id']}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Test Incident"


def test_get_incident_not_found(client):
    resp = client.get("/api/incidents/9999")
    assert resp.status_code == 404


def test_update_incident_status(client, sample_incident):
    resp = client.patch(
        f"/api/incidents/{sample_incident['id']}/status",
        json={"status": "in_progress"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "in_progress"


def test_update_status_not_found(client):
    resp = client.patch("/api/incidents/9999/status", json={"status": "closed"})
    assert resp.status_code == 404


def test_assign_incident(client, sample_incident, sample_user):
    resp = client.patch(
        f"/api/incidents/{sample_incident['id']}/assign",
        json={"assignee_id": sample_user["id"]},
    )
    assert resp.status_code == 200
    assert resp.json()["assignee_id"] == sample_user["id"]
    assert resp.json()["assignee"]["full_name"] == "Test User"


def test_assign_incident_not_found(client, sample_user):
    resp = client.patch("/api/incidents/9999/assign", json={"assignee_id": sample_user["id"]})
    assert resp.status_code == 404


def test_assign_incident_invalid_assignee(client, sample_incident):
    resp = client.patch(
        f"/api/incidents/{sample_incident['id']}/assign", json={"assignee_id": 9999}
    )
    assert resp.status_code == 404
    assert "Assignee not found" in resp.json()["detail"]


def test_search_incidents(client, sample_incident):
    resp = client.get("/api/incidents/?search=Test")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert any(i["title"] == "Test Incident" for i in data["incidents"])


def test_search_no_results(client, sample_incident):
    resp = client.get("/api/incidents/?search=nonexistent_xyz")
    assert resp.status_code == 200
    assert resp.json()["total"] == 0


def test_filter_by_priority(client, sample_incident):
    resp = client.get("/api/incidents/?priority=high")
    assert resp.status_code == 200
    data = resp.json()
    assert all(i["priority"] == "high" for i in data["incidents"])


def test_filter_by_status(client, sample_incident):
    resp = client.get("/api/incidents/?status=open")
    assert resp.status_code == 200
    data = resp.json()
    assert all(i["status"] == "open" for i in data["incidents"])


def test_filter_by_assignee(client, sample_user):
    client.post(
        "/api/incidents/",
        json={"title": "Assigned", "assignee_id": sample_user["id"]},
    )
    client.post("/api/incidents/", json={"title": "Unassigned"})

    resp = client.get(f"/api/incidents/?assignee_id={sample_user['id']}")
    assert resp.status_code == 200
    data = resp.json()
    assert all(i["assignee_id"] == sample_user["id"] for i in data["incidents"])


def test_list_incidents_pagination(client):
    for i in range(5):
        client.post("/api/incidents/", json={"title": f"Incident {i}"})

    resp = client.get("/api/incidents/?skip=2&limit=2")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["incidents"]) == 2
    assert data["total"] == 5
