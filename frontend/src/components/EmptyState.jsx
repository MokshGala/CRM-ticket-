import { Inbox } from "lucide-react";

export default function EmptyState({ title = "No tickets found", description = "Nothing to show here." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
        <Inbox className="text-orange-400" size={28} />
      </div>
      <h3 className="text-base font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-xs">{description}</p>
    </div>
  );
}
