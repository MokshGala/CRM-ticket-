// In production (single Vercel project), leave VITE_API_URL unset — API calls will be
// relative to the same domain (e.g. /api/auth/login). For local dev, set VITE_API_URL
// in frontend/.env to point at the local FastAPI server (http://localhost:8000).
const API_BASE = import.meta.env.VITE_API_URL ?? "";


/** Read JWT from localStorage */
function getToken() {
  return localStorage.getItem("crm_token");
}

/** Centralised fetch wrapper — attaches Bearer token, handles errors */
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let errorMsg = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      errorMsg = data.detail || errorMsg;
    } catch {
      // response body wasn't JSON
    }
    throw new Error(errorMsg);
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name, email, password) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function googleLogin(idToken) {
  return request("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
}

export async function getMe() {
  return request("/api/auth/me");
}


// ─── Tickets ──────────────────────────────────────────────────────────────────

export async function createTicket(subject, description) {
  return request("/api/tickets", {
    method: "POST",
    body: JSON.stringify({ subject, description }),
  });
}

/**
 * List tickets.
 * @param {Object} params - Optional filters: { status, search }
 */
export async function getTickets(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== "All") query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return request(`/api/tickets${qs}`);
}

export async function getTicket(ticketId) {
  return request(`/api/tickets/${ticketId}`);
}

/**
 * Admin: update ticket status and/or add a note.
 * @param {string} ticketId - e.g. "TKT-001"
 * @param {Object} payload  - { status?, note_text? }
 */
export async function updateTicket(ticketId, payload) {
  return request(`/api/tickets/${ticketId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
