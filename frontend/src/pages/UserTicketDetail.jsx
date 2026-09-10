import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Mail, User, MessageSquare } from "lucide-react";
import Navbar from "../components/Navbar";
import TicketBadge from "../components/TicketBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { getTicket } from "../services/api";

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

export default function UserTicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTicket(ticketId)
      .then(setTicket)
      .catch((err) => setError(err.message || "Failed to load ticket."))
      .finally(() => setLoading(false));
  }, [ticketId]);

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
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to My Tickets
        </button>

        {/* Ticket header card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
              {ticket.ticket_id}
            </span>
            <TicketBadge status={ticket.status} />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-4">{ticket.subject}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <InfoRow icon={User} label="Name" value={ticket.customer_name} />
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

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={16} className="text-orange-500" />
            <h2 className="text-sm font-semibold text-gray-800">
              Notes from Support ({ticket.notes.length})
            </h2>
          </div>

          {ticket.notes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No notes yet. Our team will update you here.</p>
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
