from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .routes import incidents, users, web

STATIC_DIR = Path(__file__).resolve().parent / "static"

app = FastAPI(
    title="Incident Management API",
    description="REST API for managing incidents with PostgreSQL",
    version="1.0.0",
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.include_router(users.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(web.router)
