import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Ticket, Eye, EyeOff } from "lucide-react";
import { login, getMe } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const tokenData = await login(email.trim(), password);
      localStorage.setItem("crm_token", tokenData.access_token);
      const userData = await getMe();
      loginSuccess(tokenData.access_token, userData);
      navigate(userData.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center px-4">
      <div className="w-full max-w-sm page-enter">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-2xl mb-4">
            <Ticket size={24} className="text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Support</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none
                           focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg outline-none
                             focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg
                         transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
                         active:scale-[0.98]"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500 mt-4 mb-2">
          Don't have an account?{" "}
          <Link to="/register" className="text-orange-500 font-medium hover:text-orange-600 transition-colors">
            Create one
          </Link>
        </p>


      </div>
    </div>
  );
}
