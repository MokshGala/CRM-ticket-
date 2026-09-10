import { useNavigate } from "react-router-dom";
import TicketBadge from "./TicketBadge";
import { ChevronRight } from "lucide-react";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * @param {Object} props
 * @param {Object} props.ticket
 * @param {string} props.linkBase - e.g. "/tickets" or "/admin/tickets"
 */
export default function TicketCard({ ticket, linkBase = "/tickets" }) {
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`${linkBase}/${ticket.ticket_id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`${linkBase}/${ticket.ticket_id}`)}
      className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between gap-4 cursor-pointer
                 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
      style={{ boxShadow: "0 1px 3px 0 rgba(0,0,0,0.07)" }}
    >
      {/* Left: ticket info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded">
            {ticket.ticket_id}
          </span>
          <TicketBadge status={ticket.status} />
        </div>
        <p className="text-sm font-semibold text-gray-800 truncate">{ticket.subject}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {ticket.customer_name} · {formatDate(ticket.created_at)}
        </p>
      </div>

      {/* Right: arrow */}
      <ChevronRight className="text-gray-400 flex-shrink-0" size={18} />
    </div>
  );
}
