import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import TicketCard from "../components/TicketCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { getTickets } from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_FILTERS = ["All", "Open", "In Progress", "Closed"];

export default function UserDashboard() {
  const { user } = useAuth();
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
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  // Debounced search: wait 400ms after typing
  useEffect(() => {
    const timer = setTimeout(() => fetchTickets(), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchTickets, search]);

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 page-enter">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Tickets</h1>
            <p className="text-sm text-gray-500 mt-0.5">Hello, {user?.name}</p>
          </div>
          <button
            id="create-ticket-btn"
            onClick={() => navigate("/tickets/create")}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold
                       px-4 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.97]"
          >
            <Plus size={16} />
            New Ticket
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="ticket-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none
                       focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              id={`filter-${s.toLowerCase().replace(" ", "-")}`}
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

        {/* Ticket list */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">{error}</div>
        ) : tickets.length === 0 ? (
          <EmptyState
            title={search || statusFilter !== "All" ? "No matching tickets" : "No tickets yet"}
            description={
              search || statusFilter !== "All"
                ? "Try adjusting your search or filter."
                : "Create your first support ticket to get started."
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.ticket_id} ticket={ticket} linkBase="/tickets" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
