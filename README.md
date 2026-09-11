<div align="center">

# 🎫 CRM Ticket System

**A full-stack customer support ticketing CRM — clean, maintainable, and built for real use.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://crm-ticket-system-nine.vercel.app/login)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Postgres-Neon-4169E1?style=flat&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)

[**Live App**](https://crm-ticket-system-nine.vercel.app/login) · [Features](#-features) · [Tech Stack](#%EF%B8%8F-tech-stack) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Demo Walkthrough](#-demo-walkthrough)

</div>

---

## 📋 Overview

CRM Ticket System is a full-stack customer support ticketing CRM built as a clean, maintainable MVP — customers raise tickets, and admins triage, update, and resolve them. It's deployed as a **single Vercel project**: a React SPA and a Python (FastAPI) serverless API served from the same domain, backed by a pooled **Neon Postgres** database.

| | |
|---|---|
| 🔗 **Live demo** | [crm-ticket-system-nine.vercel.app](https://crm-ticket-system-nine.vercel.app/login) |
| 🧑‍💻 **Demo login (User)** | `user@demo.com` / `user123` |
| 🛠️ **Demo login (Admin)** | `admin@demo.com` / `admin123` |

---

## ✨ Features

- 🔐 **JWT authentication** — secure, stateless auth with bcrypt-hashed passwords and 8-hour token expiry
- 🎫 **Auto-generated Ticket IDs** — human-readable IDs like `TKT-001`, `TKT-002`, ...
- 👤 **Role-based access control** — users can only see and manage their own tickets; admins see and manage everything
- 🔎 **Search & filter** — admins can search by ticket ID, name, email, subject, or description, and filter by status
- 📊 **Ticket lifecycle** — `Open → In Progress → Closed`, with status updates logged
- 📝 **Notes on tickets** — admins can add timestamped, authored notes as they work a ticket
- 💾 **Persistent storage** — pooled Neon Postgres database that survives restarts and cold starts
- ⚡ **Single-domain deployment** — frontend and backend share one origin in production, so there's no CORS juggling or separate API URL to configure

---

## 🏗️ Architecture

The frontend and backend are deployed as **one Vercel project**: static assets are served for every route except `/api/*`, which is routed to a Python serverless function.

```
┌──────────────────────────────────────────────────────┐
│                  VERCEL (single project)              │
│                                                        │
│  ┌───────────────────┐     ┌───────────────────────┐  │
│  │  React Frontend     │     │  FastAPI Backend       │  │
│  │  (Vite SSG)          │     │  (Python Serverless Fn)│  │
│  │  frontend/dist/      │     │  api/index.py          │  │
│  │                      │     │  → backend/app/main.py │  │
│  └──────────┬───────────┘     └───────────┬───────────┘  │
│             │      /api/* routes            │              │
│             └─────────────────────────────┘              │
└──────────────────────────────────────────────────────┘
                          │
                          │ psycopg2 (SSL)
                          ▼
              ┌────────────────────────┐
              │    Neon Postgres DB      │
              │   (pooled connection)    │
              └────────────────────────┘
```

**Routing (`vercel.json`)**

| URL Pattern | Handled by |
|---|---|
| `/api/*` | Python serverless function (`api/index.py`) |
| `/*` (everything else) | React SPA (`frontend/dist/index.html`) |

**Auth flow**

```
1. POST /api/auth/login {email, password}
2. Backend verifies password with bcrypt
3. Backend issues a JWT (8h expiry) via PyJWT
4. Frontend stores the token in localStorage
5. Every subsequent request sends Authorization: Bearer <token>
6. Backend decodes the JWT, resolves the user, and attaches it to the request
```

---

## 🗂️ Data Model

```
User ──< Ticket ──< Note
```

<details>
<summary><strong>Expand table schemas</strong></summary>

**`users`**
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | Auto-increment |
| `name` | String(100) | Display name |
| `email` | String(255) | Unique, indexed |
| `hashed_password` | String(255) | bcrypt, NULL for OAuth-only users |
| `role` | String(20) | `user` or `admin` |
| `created_at` | DateTime | UTC |

**`tickets`**
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | Auto-increment |
| `ticket_id` | String(20) | Unique, e.g. `TKT-001` |
| `customer_name` / `customer_email` | String | Copied from owner account at creation |
| `subject` / `description` | String / Text | |
| `status` | String(20) | `Open` / `In Progress` / `Closed` |
| `owner_id` | FK → `users.id` | |
| `created_at` / `updated_at` | DateTime | UTC, `updated_at` bumped on every change |

**`notes`**
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | |
| `ticket_id` | FK → `tickets.id` | |
| `note_text` | Text | |
| `author` | String(100) | Admin's name at time of writing |
| `created_at` | DateTime | UTC |

</details>

---

## 🛠️ Tech Stack

<table>
<tr><td valign="top">

**Frontend**
- React 19 + Vite 8
- TailwindCSS v4
- React Router v7
- Lucide React (icons)
- React Hot Toast

</td><td valign="top">

**Backend**
- FastAPI 0.115
- SQLAlchemy 2.x (sync)
- psycopg2-binary
- Pydantic v2
- JWT (PyJWT) + bcrypt

</td><td valign="top">

**Infra**
- Neon PostgreSQL (pooled)
- Vercel (unified deploy)
- Uvicorn (local dev)

</td></tr>
</table>

---

## 📁 Project Structure

```
crm-ticket-system/
├── api/
│   └── index.py                  # Vercel serverless entrypoint
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, DB init, seeding
│   │   ├── database.py           # SQLAlchemy engine + session
│   │   ├── models.py             # ORM models (User, Ticket, Note)
│   │   ├── schemas.py            # Pydantic v2 request/response schemas
│   │   ├── crud.py               # All DB read/write operations
│   │   ├── auth.py               # JWT creation + FastAPI auth dependencies
│   │   └── routes/
│   │       ├── auth.py           # POST /api/auth/login, GET /api/auth/me
│   │       └── tickets.py        # CRUD ticket endpoints
│   ├── requirements.txt
│   └── .env                      # local dev secrets (not committed)
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state + localStorage persistence
│   │   ├── services/
│   │   │   └── api.js                # All API calls — single source of truth
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TicketCard.jsx
│   │   │   ├── TicketBadge.jsx
│   │   │   ├── PrivateRoute.jsx      # PrivateRoute + AdminRoute guards
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── CreateTicketPage.jsx
│   │   │   ├── UserTicketDetail.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── AdminTicketDetail.jsx
│   │   ├── App.jsx                   # React Router routes
│   │   └── main.jsx
│   ├── .env                          # VITE_API_URL for local dev
│   └── vite.config.js
├── scripts/
│   └── seed.py                        # Manual DB seed script
├── requirements.txt                    # Root-level, read by Vercel
├── .gitignore
└── vercel.json                         # Build + routing config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A Postgres database (e.g. a free [Neon](https://neon.tech) project)

### 1. Clone the repo
```bash
git clone https://github.com/MokshGala/crm-ticket-system.git
cd crm-ticket-system
```

### 2. Backend
```bash
cd backend

# create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# or: source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt

# create backend/.env with:
# DATABASE_URL=postgresql://...
# SECRET_KEY=your-secret-key
# ACCESS_TOKEN_EXPIRE_MINUTES=480

uvicorn app.main:app --reload --port 8000
```
API: http://localhost:8000 · Interactive docs: http://localhost:8000/docs

### 3. Frontend
```bash
cd frontend
npm install

# create frontend/.env with:
# VITE_API_URL=http://localhost:8000

npm run dev
```
App: http://localhost:5173

> In production, `VITE_API_URL` is left **unset** — the frontend calls relative `/api/...` paths since it shares a domain with the backend on Vercel.

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Register a new user (role always `user`) |
| `POST` | `/api/auth/login` | — | `{ email, password }` → `{ access_token, token_type }` |
| `GET` | `/api/auth/me` | Bearer | Current user profile |

### Tickets — `/api/tickets`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/tickets` | User/Admin | Create a ticket (name/email auto-filled from account) |
| `GET` | `/api/tickets` | User/Admin | List tickets — own only for users, all for admins. Query: `?status=Open&search=foo` |
| `GET` | `/api/tickets/{ticket_id}` | User/Admin | Full ticket detail + notes |
| `PUT` | `/api/tickets/{ticket_id}` | Admin only | `{ status?, note_text? }` |

---

## 🔑 Environment Variables

| Variable | Default / Set in | Purpose |
|---|---|---|
| `DATABASE_URL` | Vercel dashboard / `backend/.env` | Neon pooled Postgres connection string |
| `SECRET_KEY` | Vercel dashboard / `backend/.env` | JWT signing secret — **change before deploying** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | Token lifetime (8 hours) |
| `FRONTEND_ORIGIN` | Vercel dashboard | Added to the CORS allow-list |
| `VITE_API_URL` | `frontend/.env` (local only) | Backend URL for local dev — unset in prod |

---

## 👥 Roles & Permissions

| Role | Can do |
|---|---|
| `user` | Register, log in, create tickets, view **own** tickets |
| `admin` | Everything a user can, plus view **all** tickets, update status, and add notes |

---

## 🎬 Demo Walkthrough

A quick 3–5 minute tour of the app:

1. Open the [live app](https://crm-ticket-system-nine.vercel.app/login)
2. Log in as `user@demo.com` / `user123`
3. Click **New Ticket** → fill in a subject and description → submit
4. Note the generated Ticket ID (e.g. `TKT-001`)
5. Log out → log back in as `admin@demo.com` / `admin123`
6. See the new ticket appear in the admin dashboard
7. Search for it by name or ticket ID
8. Filter the queue by **Open** status
9. Open the ticket → change status to **In Progress**
10. Add a note → save changes
11. Log out → log back in as the user → open the ticket → see the updated status and note

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** — never stored in plaintext
- Auth uses short-lived **JWTs** (8h default), verified on every protected request
- Demo credentials above are for the **live demo only** — rotate `SECRET_KEY` and demo accounts before any real deployment

---

## 📄 License

This project is open for learning and reference purposes. Feel free to fork and adapt.

---

<div align="center">

Built by **[Moksh Gala](https://github.com/MokshGala)**

</div>
