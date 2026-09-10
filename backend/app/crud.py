from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import or_
from sqlalchemy.orm import Session
import bcrypt

from app import models, schemas


# ─── Password Helpers ─────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ─── User CRUD ────────────────────────────────────────────────────────────────

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, name: str, email: str, password: str, role: str = "user") -> models.User:
    user = models.User(
        name=name,
        email=email,
        hashed_password=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not user.hashed_password:
        # This is an OAuth-only account — cannot log in with password
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_or_get_google_user(db: Session, email: str, name: str) -> models.User:
    """Return existing user or create a new OAuth user (no password)."""
    user = get_user_by_email(db, email)
    if user:
        return user
    user = models.User(
        name=name,
        email=email,
        hashed_password=None,  # OAuth users have no password
        role=models.UserRole.user,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ─── Ticket ID Generation ─────────────────────────────────────────────────────

def generate_ticket_id(db: Session) -> str:
    """Generate the next sequential ticket ID: TKT-001, TKT-002, …"""
    last = db.query(models.Ticket).order_by(models.Ticket.id.desc()).first()
    next_num = (last.id + 1) if last else 1
    return f"TKT-{next_num:03d}"


# ─── Ticket CRUD ──────────────────────────────────────────────────────────────

def create_ticket(
    db: Session,
    data: schemas.TicketCreate,
    owner: models.User,
) -> models.Ticket:
    ticket_id = generate_ticket_id(db)
    ticket = models.Ticket(
        ticket_id=ticket_id,
        customer_name=owner.name,
        customer_email=owner.email,
        subject=data.subject,
        description=data.description,
        status="Open",
        owner_id=owner.id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def get_tickets(
    db: Session,
    owner_id: Optional[int] = None,   # None → admin sees all
    status: Optional[str] = None,
    search: Optional[str] = None,
) -> List[models.Ticket]:
    query = db.query(models.Ticket)

    # Scope to owner for regular users
    if owner_id is not None:
        query = query.filter(models.Ticket.owner_id == owner_id)

    # Filter by status
    if status and status.lower() != "all":
        query = query.filter(models.Ticket.status == status)

    # Search across key fields
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                models.Ticket.ticket_id.ilike(term),
                models.Ticket.customer_name.ilike(term),
                models.Ticket.customer_email.ilike(term),
                models.Ticket.subject.ilike(term),
                models.Ticket.description.ilike(term),
            )
        )

    return query.order_by(models.Ticket.created_at.desc()).all()


def get_ticket_by_ticket_id(db: Session, ticket_id: str) -> Optional[models.Ticket]:
    return db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()


def update_ticket(
    db: Session,
    ticket: models.Ticket,
    data: schemas.TicketUpdate,
    admin_name: str,
) -> models.Ticket:
    """Update ticket status and/or append a note. Bumps updated_at."""
    changed = False

    if data.status and data.status != ticket.status:
        ticket.status = data.status
        changed = True

    if data.note_text:
        note = models.Note(
            ticket_id=ticket.id,
            note_text=data.note_text,
            author=admin_name,
        )
        db.add(note)
        changed = True

    if changed:
        ticket.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(ticket)

    return ticket
