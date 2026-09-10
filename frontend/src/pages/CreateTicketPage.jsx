import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import Navbar from "../components/Navbar";
import { createTicket } from "../services/api";

export default function CreateTicketPage() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // { ticket_id }

  function validate() {
    const e = {};
    if (!subject.trim()) e.subject = "Subject is required.";
    if (subject.trim().length > 255) e.subject = "Subject must be 255 characters or fewer.";
    if (!description.trim()) e.description = "Description is required.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e_errors = validate();
    if (Object.keys(e_errors).length > 0) {
      setErrors(e_errors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const ticket = await createTicket(subject.trim(), description.trim());
      setSuccess(ticket);
    } catch (err) {
      setErrors({ global: err.message || "Failed to submit ticket." });
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F7F4]">
        <Navbar />
        <main className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center page-enter">
          <div className="bg-white rounded-2xl border border-gray-100 p-8" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Send size={24} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Ticket Created!</h2>
            <p className="text-sm text-gray-500 mb-4">Your support ticket has been submitted successfully.</p>
            <div className="bg-orange-50 border border-orange-100 rounded-xl py-3 px-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Your Ticket ID</p>
              <p className="text-2xl font-mono font-bold text-orange-600">{success.ticket_id}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">{success.subject}</p>
            <div className="flex gap-3">
              <button
                id="view-ticket-btn"
                onClick={() => navigate(`/tickets/${success.ticket_id}`)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-[0.97]"
              >
                View Ticket
              </button>
              <button
                id="back-dashboard-btn"
                onClick={() => navigate("/dashboard")}
                className="flex-1 border border-gray-200 text-sm font-medium py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
              >
                My Tickets
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8 page-enter">
        {/* Header */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to My Tickets
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6">Create Support Ticket</h1>

        <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition
                  ${errors.subject ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-orange-400 focus:ring-orange-100"}
                  focus:ring-2`}
              />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue in detail…"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none resize-none transition
                  ${errors.description ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-orange-400 focus:ring-orange-100"}
                  focus:ring-2`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            {/* Global error */}
            {errors.global && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {errors.global}
              </p>
            )}

            {/* Submit */}
            <button
              id="submit-ticket-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white
                         text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-[0.97] disabled:opacity-60"
            >
              <Send size={15} />
              {loading ? "Submitting…" : "Submit Ticket"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
