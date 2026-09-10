from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas, models
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.post("", response_model=schemas.TicketDetail, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: schemas.TicketCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Any authenticated user can create a ticket. Name/email taken from their account."""
    ticket = crud.create_ticket(db, payload, owner=current_user)
    return ticket


@router.get("", response_model=List[schemas.TicketOut])
def list_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Returns tickets based on role:
    - Admin: all tickets (with optional status/search filters)
    - User: only their own tickets
    """
    owner_id = None if current_user.role == "admin" else current_user.id
    tickets = crud.get_tickets(db, owner_id=owner_id, status=status_filter, search=search)
    return tickets


@router.get("/{ticket_id}", response_model=schemas.TicketDetail)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Returns full ticket detail including notes.
    - Admin: can view any ticket
    - User: can only view their own
    """
    ticket = crud.get_ticket_by_ticket_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    # Enforce ownership for non-admins
    if current_user.role != "admin" and ticket.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return ticket


@router.put("/{ticket_id}", response_model=schemas.TicketDetail)
def update_ticket(
    ticket_id: str,
    payload: schemas.TicketUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),  # Admin only
):
    """Admin-only: update ticket status and/or add a note."""
    ticket = crud.get_ticket_by_ticket_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    # Require at least one action
    if payload.status is None and not payload.note_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide at least a status update or a note.",
        )

    updated = crud.update_ticket(db, ticket, payload, admin_name=current_user.name)
    return updated
