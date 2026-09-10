import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import TicketCard from "../components/TicketCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getTickets } from "../services/api";

const STATUS_FILTERS = ["All", "Open", "In Progress", "Closed"];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTickets({ status: statusFilter, search });
      setTickets(data);
    } catch (err) {
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTickets(), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchTickets, search]);

  // Count tickets per status for summary cards
  const counts = {
    open: tickets.filter((t) => t.status === "Open").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    closed: tickets.filter((t) => t.status === "Closed").length,
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all customer support tickets</p>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Open", value: counts.open, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "In Progress", value: counts.inProgress, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Closed", value: counts.closed, color: "text-gray-500", bg: "bg-gray-50" },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-100 p-4 text-center"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <p className={`text-2xl font-bold ${color}`}>{loading ? "—" : value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="admin-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, ticket ID, or description…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none
                       focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              id={`admin-filter-${s.toLowerCase().replace(" ", "-")}`}
              onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150
                ${statusFilter === s
                  ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Total results label */}
        {!loading && !error && (
          <div className="flex items-center gap-1.5 mb-3">
            <Users size={13} className="text-gray-400" />
            <p className="text-xs text-gray-400">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
              {statusFilter !== "All" && ` · ${statusFilter}`}
              {search && ` matching "${search}"`}
            </p>
          </div>
        )}

        {/* Ticket list */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">{error}</div>
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No tickets found"
            description={
              search || statusFilter !== "All"
                ? "Try a different search term or status filter."
                : "No tickets have been submitted yet."
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.ticket_id} ticket={ticket} linkBase="/admin/tickets" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
