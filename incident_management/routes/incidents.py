from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Incident, IncidentPriority, IncidentStatus, User
from ..schemas import (
    IncidentAssign,
    IncidentCreate,
    IncidentListResponse,
    IncidentResponse,
    IncidentUpdateStatus,
)

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.post("/", response_model=IncidentResponse, status_code=201)
def create_incident(data: IncidentCreate, db: Session = Depends(get_db)):
    if data.assignee_id is not None:
        assignee = db.query(User).filter(User.id == data.assignee_id).first()
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee not found")

    incident = Incident(**data.model_dump())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return db.query(Incident).options(joinedload(Incident.assignee)).filter(Incident.id == incident.id).first()


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = (
        db.query(Incident)
        .options(joinedload(Incident.assignee))
        .filter(Incident.id == incident_id)
        .first()
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: int, data: IncidentUpdateStatus, db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = data.status
    db.commit()
    db.refresh(incident)
    return db.query(Incident).options(joinedload(Incident.assignee)).filter(Incident.id == incident.id).first()


@router.patch("/{incident_id}/assign", response_model=IncidentResponse)
def assign_incident(
    incident_id: int, data: IncidentAssign, db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    assignee = db.query(User).filter(User.id == data.assignee_id).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee not found")

    incident.assignee_id = data.assignee_id
    db.commit()
    db.refresh(incident)
    return db.query(Incident).options(joinedload(Incident.assignee)).filter(Incident.id == incident.id).first()


@router.get("/", response_model=IncidentListResponse)
def search_incidents(
    status: IncidentStatus | None = Query(None, description="Filter by status"),
    priority: IncidentPriority | None = Query(None, description="Filter by priority"),
    assignee_id: int | None = Query(None, description="Filter by assignee user ID"),
    search: str | None = Query(None, description="Search in title and description"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    db: Session = Depends(get_db),
):
    query = db.query(Incident).options(joinedload(Incident.assignee))

    if status is not None:
        query = query.filter(Incident.status == status)
    if priority is not None:
        query = query.filter(Incident.priority == priority)
    if assignee_id is not None:
        query = query.filter(Incident.assignee_id == assignee_id)
    if search:
        escaped = search.replace("%", "\\%").replace("_", "\\_")
        pattern = f"%{escaped}%"
        query = query.filter(
            Incident.title.ilike(pattern) | Incident.description.ilike(pattern)
        )

    total = query.count()
    incidents = query.order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()

    return IncidentListResponse(incidents=incidents, total=total)
