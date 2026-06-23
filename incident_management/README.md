# Incident Management API

REST API for managing incidents, built with Python (FastAPI) and PostgreSQL.

## Features

- Create Incident
- Update Incident Status
- Get Incident by ID
- Search Incidents (text search in title/description)
- Assign Incident to a user
- Filter incidents by priority, status, or assignee
- Pagination support

## Tech Stack

- **Python 3.12+** with **FastAPI**
- **PostgreSQL** database
- **SQLAlchemy** ORM with **Alembic** migrations
- **Pydantic** for request/response validation

## Setup

### 1. Install PostgreSQL

```bash
sudo apt-get install postgresql postgresql-client libpq-dev
sudo systemctl start postgresql
```

### 2. Create Database

```bash
sudo -u postgres psql -c "CREATE USER incident_user WITH PASSWORD 'incident_pass';"
sudo -u postgres psql -c "CREATE DATABASE incident_db OWNER incident_user;"
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run Migrations

```bash
alembic upgrade head
```

### 5. Start the Server

```bash
uvicorn incident_management.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

## API Endpoints

### Users

| Method | Endpoint          | Description    |
| ------ | ----------------- | -------------- |
| POST   | `/api/users/`     | Create user    |
| GET    | `/api/users/`     | List all users |
| GET    | `/api/users/{id}` | Get user by ID |

### Incidents

| Method | Endpoint                         | Description                     |
| ------ | -------------------------------- | ------------------------------- |
| POST   | `/api/incidents/`                | Create incident                 |
| GET    | `/api/incidents/{id}`            | Get incident by ID              |
| PATCH  | `/api/incidents/{id}/status`     | Update incident status          |
| PATCH  | `/api/incidents/{id}/assign`     | Assign incident to user         |
| GET    | `/api/incidents/?status=open`    | Filter by status                |
| GET    | `/api/incidents/?priority=high`  | Filter by priority              |
| GET    | `/api/incidents/?assignee_id=1`  | Filter by assignee              |
| GET    | `/api/incidents/?search=keyword` | Search in title and description |

### Enum Values

**Priority:** `low`, `medium`, `high`, `critical`

**Status:** `open`, `in_progress`, `resolved`, `closed`

## Example Requests

```bash
# Create a user
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","full_name":"John Doe"}'

# Create an incident
curl -X POST http://localhost:8000/api/incidents/ \
  -H "Content-Type: application/json" \
  -d '{"title":"Server Down","description":"Production server unresponsive","priority":"critical"}'

# Update status
curl -X PATCH http://localhost:8000/api/incidents/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'

# Assign incident
curl -X PATCH http://localhost:8000/api/incidents/1/assign \
  -H "Content-Type: application/json" \
  -d '{"assignee_id":1}'

# Search incidents
curl "http://localhost:8000/api/incidents/?search=server&priority=critical"
```

## Environment Variables

| Variable       | Default                                                               | Description           |
| -------------- | --------------------------------------------------------------------- | --------------------- |
| `DATABASE_URL` | `postgresql://incident_user:incident_pass@localhost:5432/incident_db` | PostgreSQL connection |
