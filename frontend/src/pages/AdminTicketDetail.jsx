import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Mail, User, MessageSquare, RefreshCw } from "lucide-react";
import Navbar from "../components/Navbar";
import TicketBadge from "../components/TicketBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { getTicket, updateTicket } from "../services/api";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

const STATUSES = ["Open", "In Progress", "Closed"];

export default function AdminTicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Update form state
  const [newStatus, setNewStatus] = useState("");
  const [noteText, setNoteText] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  async function loadTicket() {
    setLoading(true);
    setError("");
    try {
      const data = await getTicket(ticketId);
      setTicket(data);
      setNewStatus(data.status); // default to current
    } catch (err) {
      setError(err.message || "Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess("");

    const statusChanged = newStatus !== ticket.status;
    const hasNote = noteText.trim().length > 0;

    if (!statusChanged && !hasNote) {
      setUpdateError("Change the status or add a note before saving.");
      return;
    }

    setUpdateLoading(true);
    try {
      const payload = {};
      if (statusChanged) payload.status = newStatus;
      if (hasNote) payload.note_text = noteText.trim();

      const updated = await updateTicket(ticketId, payload);
      setTicket(updated);
      setNewStatus(updated.status);
      setNoteText("");
      setUpdateSuccess("Ticket updated successfully.");
      setTimeout(() => setUpdateSuccess(""), 3000);
    } catch (err) {
      setUpdateError(err.message || "Update failed.");
    } finally {
      setUpdateLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />
      <LoadingSpinner />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 page-enter">
        {/* Back */}
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>

        {/* Ticket info card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
              {ticket.ticket_id}
            </span>
            <TicketBadge status={ticket.status} />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-4">{ticket.subject}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <InfoRow icon={User} label="Customer Name" value={ticket.customer_name} />
            <InfoRow icon={Mail} label="Email" value={ticket.customer_email} />
            <InfoRow icon={Calendar} label="Created" value={formatDateTime(ticket.created_at)} />
            <InfoRow icon={Calendar} label="Last Updated" value={formatDateTime(ticket.updated_at)} />
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-4">
              {ticket.description}
            </p>
          </div>
        </div>

        {/* Admin Action Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={15} className="text-orange-500" />
            <h2 className="text-sm font-semibold text-gray-800">Update Ticket</h2>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Status selector */}
            <div>
              <label htmlFor="status-select" className="block text-xs font-medium text-gray-500 mb-1.5">
                Status
              </label>
              <div className="flex gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    id={`status-btn-${s.toLowerCase().replace(" ", "-")}`}
                    onClick={() => setNewStatus(s)}
                    className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-all duration-150
                      ${newStatus === s
                        ? s === "Open"
                          ? "bg-orange-500 border-orange-500 text-white"
                          : s === "In Progress"
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-gray-600 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Note textarea */}
            <div>
              <label htmlFor="note-input" className="block text-xs font-medium text-gray-500 mb-1.5">
                Add Note <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="note-input"
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add an internal note or message to the customer…"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none resize-none
                           focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
              />
            </div>

            {/* Feedback */}
            {updateError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{updateError}</p>
            )}
            {updateSuccess && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{updateSuccess}</p>
            )}

            {/* Save */}
            <button
              id="save-update-btn"
              type="submit"
              disabled={updateLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl
                         transition-all active:scale-[0.97] disabled:opacity-60"
            >
              {updateLoading ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Notes history */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={15} className="text-orange-500" />
            <h2 className="text-sm font-semibold text-gray-800">Notes History ({ticket.notes.length})</h2>
          </div>

          {ticket.notes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No notes added yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {ticket.notes.map((note) => (
                <div key={note.id} className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-700">{note.author}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(note.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{note.note_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
