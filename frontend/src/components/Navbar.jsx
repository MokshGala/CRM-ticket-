import { useNavigate } from "react-router-dom";
import { LogOut, Ticket, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const dashboardPath = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate(dashboardPath)}
          className="flex items-center gap-2 font-semibold text-gray-800 hover:text-orange-600 transition-colors"
        >
          <Ticket size={20} className="text-orange-500" />
          <span>CRM Support</span>
          {user?.role === "admin" && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium ml-1">
              Admin
            </span>
          )}
        </button>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
              <User size={13} className="text-orange-600" />
            </div>
            <span className="hidden sm:block font-medium">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
          >
            <LogOut size={15} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
