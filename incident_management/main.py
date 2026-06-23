from fastapi import FastAPI

from .routes import incidents, users

app = FastAPI(
    title="Incident Management API",
    description="REST API for managing incidents with PostgreSQL",
    version="1.0.0",
)

app.include_router(users.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")


@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Incident Management API"}
