from datetime import datetime

from pydantic import BaseModel, ConfigDict

from .models import IncidentPriority, IncidentStatus


# --- User Schemas ---


class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    full_name: str


# --- Incident Schemas ---


class IncidentCreate(BaseModel):
    title: str
    description: str | None = None
    priority: IncidentPriority = IncidentPriority.MEDIUM
    assignee_id: int | None = None


class IncidentUpdateStatus(BaseModel):
    status: IncidentStatus


class IncidentAssign(BaseModel):
    assignee_id: int


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: IncidentStatus
    priority: IncidentPriority
    assignee_id: int | None
    assignee: UserResponse | None
    created_at: datetime
    updated_at: datetime


class IncidentListResponse(BaseModel):
    incidents: list[IncidentResponse]
    total: int
