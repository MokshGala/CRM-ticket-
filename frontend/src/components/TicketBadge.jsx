const STATUS_STYLES = {
  "Open": "bg-orange-100 text-orange-700 border-orange-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  "Closed": "bg-gray-100 text-gray-600 border-gray-200",
};

export default function TicketBadge({ status }) {
  const classes = STATUS_STYLES[status] || "bg-gray-100 text-gray-500";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${classes}`}
    >
      {status}
    </span>
  );
}
