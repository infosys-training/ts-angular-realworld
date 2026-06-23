from pathlib import Path

from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Incident, IncidentPriority, IncidentStatus, User

router = APIRouter(tags=["Web UI"])

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


@router.get("/")
def dashboard(request: Request, db: Session = Depends(get_db)):
    incidents = (
        db.query(Incident)
        .options(joinedload(Incident.assignee))
        .order_by(Incident.created_at.desc())
        .limit(10)
        .all()
    )
    stats = {
        "open": db.query(Incident).filter(Incident.status == IncidentStatus.OPEN).count(),
        "in_progress": db.query(Incident).filter(Incident.status == IncidentStatus.IN_PROGRESS).count(),
        "resolved": db.query(Incident).filter(Incident.status == IncidentStatus.RESOLVED).count(),
        "closed": db.query(Incident).filter(Incident.status == IncidentStatus.CLOSED).count(),
    }
    return templates.TemplateResponse(
        request, "dashboard.html", {"incidents": incidents, "stats": stats}
    )


@router.get("/incidents")
def incidents_list(
    request: Request,
    status: str = "",
    priority: str = "",
    assignee_id: str = "",
    search: str = "",
    db: Session = Depends(get_db),
):
    query = db.query(Incident).options(joinedload(Incident.assignee))

    if status:
        query = query.filter(Incident.status == IncidentStatus(status))
    if priority:
        query = query.filter(Incident.priority == IncidentPriority(priority))
    if assignee_id:
        query = query.filter(Incident.assignee_id == int(assignee_id))
    if search:
        escaped = search.replace("%", "\\%").replace("_", "\\_")
        pattern = f"%{escaped}%"
        query = query.filter(
            Incident.title.ilike(pattern) | Incident.description.ilike(pattern)
        )

    total = query.count()
    incidents = query.order_by(Incident.created_at.desc()).all()
    users = db.query(User).all()

    filters = {
        "status": status,
        "priority": priority,
        "assignee_id": assignee_id,
        "search": search,
    }
    return templates.TemplateResponse(
        request,
        "incidents_list.html",
        {"incidents": incidents, "total": total, "users": users, "filters": filters},
    )


@router.get("/incidents/new")
def incident_create_form(request: Request, db: Session = Depends(get_db)):
    users = db.query(User).all()
    return templates.TemplateResponse(
        request, "incident_create.html", {"users": users}
    )


@router.post("/incidents/new")
def incident_create(
    title: str = Form(...),
    description: str = Form(""),
    priority: str = Form("medium"),
    assignee_id: str = Form(""),
    db: Session = Depends(get_db),
):
    incident = Incident(
        title=title,
        description=description or None,
        priority=IncidentPriority(priority),
        assignee_id=int(assignee_id) if assignee_id else None,
    )
    db.add(incident)
    db.commit()
    return RedirectResponse(url=f"/incidents/{incident.id}", status_code=303)


@router.get("/incidents/{incident_id}")
def incident_detail(
    request: Request, incident_id: int, db: Session = Depends(get_db)
):
    incident = (
        db.query(Incident)
        .options(joinedload(Incident.assignee))
        .filter(Incident.id == incident_id)
        .first()
    )
    if not incident:
        return templates.TemplateResponse(
            request, "base.html", {"error": "Incident not found"}, status_code=404
        )
    users = db.query(User).all()
    return templates.TemplateResponse(
        request, "incident_detail.html", {"incident": incident, "users": users}
    )


@router.post("/incidents/{incident_id}/status")
def incident_update_status(
    incident_id: int, status: str = Form(...), db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident:
        incident.status = IncidentStatus(status)
        db.commit()
    return RedirectResponse(url=f"/incidents/{incident_id}", status_code=303)


@router.post("/incidents/{incident_id}/assign")
def incident_assign(
    incident_id: int, assignee_id: str = Form(""), db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident:
        incident.assignee_id = int(assignee_id) if assignee_id else None
        db.commit()
    return RedirectResponse(url=f"/incidents/{incident_id}", status_code=303)


@router.get("/users")
def users_list(request: Request, db: Session = Depends(get_db)):
    users = db.query(User).all()
    return templates.TemplateResponse(
        request, "users_list.html", {"users": users}
    )


@router.get("/users/new")
def user_create_form(request: Request):
    return templates.TemplateResponse(request, "user_create.html")


@router.post("/users/new")
def user_create(
    username: str = Form(...),
    full_name: str = Form(...),
    email: str = Form(...),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(User)
        .filter((User.username == username) | (User.email == email))
        .first()
    )
    if existing:
        return RedirectResponse(url="/users/new?error=exists", status_code=303)

    user = User(username=username, full_name=full_name, email=email)
    db.add(user)
    db.commit()
    return RedirectResponse(url="/users", status_code=303)
