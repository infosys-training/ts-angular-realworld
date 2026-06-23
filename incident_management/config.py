import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://incident_user:incident_pass@localhost:5432/incident_db",
)
