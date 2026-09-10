# CRM Ticket System

A full-stack Customer Support Ticketing CRM built as a clean, maintainable MVP.

## Features

- **User side**: Login, create support tickets, view your own tickets and their status/notes
- **Admin side**: View all tickets, search, filter by status, update status, add notes
- **Auto-generated Ticket IDs**: `TKT-001`, `TKT-002`, ...
- **Role-based access**: Users can only see their own tickets; admins see everything
- **JWT Authentication**: Secure, stateless auth with 8-hour token expiry
- **Persistent storage**: SQLite database that survives server restarts

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Python FastAPI |
| Database | SQLite via SQLAlchemy ORM |
| Auth | JWT (python-jose) + bcrypt |
| HTTP Client | Fetch API |

## Project Structure

```
crm-ticket-system/
  backend/
    app/
      main.py          - FastAPI app, CORS, startup seeding
      database.py      - SQLAlchemy engine + session
      models.py        - ORM models (User, Ticket, Note)
      schemas.py       - Pydantic v2 request/response schemas
      crud.py          - All DB operations
      auth.py          - JWT creation + FastAPI dependencies
      routes/
        auth.py        - POST /api/auth/login, GET /api/auth/me
        tickets.py     - CRUD ticket endpoints
    requirements.txt
  frontend/
    src/
      context/
        AuthContext.jsx    - Auth state + localStorage persistence
      services/
        api.js             - All API calls (single source of truth)
      components/
        Navbar.jsx
        TicketCard.jsx
        TicketBadge.jsx
        PrivateRoute.jsx   - PrivateRoute + AdminRoute guards
        LoadingSpinner.jsx
        EmptyState.jsx
      pages/
        LoginPage.jsx
        UserDashboard.jsx
        CreateTicketPage.jsx
        UserTicketDetail.jsx
        AdminDashboard.jsx
        AdminTicketDetail.jsx
      App.jsx          - React Router routes
      main.jsx
  .env.example
  .gitignore
  README.md
```

## Database Schema

### users
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| name | VARCHAR(100) | |
| email | VARCHAR(255) | Unique |
| hashed_password | VARCHAR(255) | bcrypt |
| role | ENUM | user or admin |
| created_at | DATETIME | UTC |

### tickets
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| ticket_id | VARCHAR(20) | Unique, e.g. TKT-001 |
| customer_name | VARCHAR(100) | Copied from owner account |
| customer_email | VARCHAR(255) | Copied from owner account |
| subject | VARCHAR(255) | |
| description | TEXT | |
| status | VARCHAR(20) | Open / In Progress / Closed |
| owner_id | INTEGER FK | References users.id |
| created_at | DATETIME | UTC |
| updated_at | DATETIME | UTC, bumped on every update |

### notes
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| ticket_id | INTEGER FK | References tickets.id |
| note_text | TEXT | |
| author | VARCHAR(100) | Admin name who added it |
| created_at | DATETIME | UTC |

## API Endpoints

### Auth
```
POST /api/auth/login        Body: { email, password } -> { access_token, token_type }
GET  /api/auth/me           Header: Bearer <token>    -> UserOut
```

### Tickets
```
POST /api/tickets                  Create ticket (auth required)
GET  /api/tickets                  List tickets (admin=all, user=own)
                                   Query: ?status=Open&search=foo
GET  /api/tickets/{ticket_id}      Ticket detail + notes
PUT  /api/tickets/{ticket_id}      Admin only: { status?, note_text? }
```

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# or: source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at: http://localhost:8000
Interactive docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at: http://localhost:5173

## Environment Variables

Copy `.env.example` to `.env` in the `backend/` directory:

```
SECRET_KEY=your-super-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

| Variable | Default | Description |
|---|---|---|
| SECRET_KEY | change-me-in-production-please | JWT signing secret |
| ACCESS_TOKEN_EXPIRE_MINUTES | 480 | Token lifetime (8 hours) |

IMPORTANT: Change SECRET_KEY before deploying to production.

## Demo Credentials

These accounts are automatically created on first server start:

| Role | Email | Password |
|---|---|---|
| User | user@demo.com | user123 |
| Admin | admin@demo.com | admin123 |

## Demo Flow (3-5 minutes)

1. Open http://localhost:5173
2. Click "User login" -> sign in as user@demo.com
3. Click New Ticket -> fill subject + description -> submit
4. Note the generated Ticket ID (e.g. TKT-001)
5. Log out -> click "Admin login" -> sign in as admin@demo.com
6. See the ticket appear in the admin dashboard
7. Search for it by name or ticket ID
8. Filter by Open status
9. Click the ticket -> change status to In Progress
10. Add a note -> click Save Changes
11. Log out -> log back in as user -> open ticket -> see updated status + note

## Deployment Notes

For production deployment:

1. Set a strong SECRET_KEY in your environment
2. Build the frontend: npm run build in /frontend
3. Serve the dist/ folder via a static host (Vercel, Netlify, S3)
4. Deploy the FastAPI backend (Railway, Render, Fly.io)
5. Update the CORS allow_origins in main.py with your frontend domain
6. Set VITE_API_URL in your frontend environment to point to the deployed backend
