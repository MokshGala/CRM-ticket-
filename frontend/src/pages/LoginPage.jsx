import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Ticket, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { login, googleLogin, getMe } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  function fillDemo(role) {
    if (role === "admin") {
      setEmail("admin@demo.com");
      setPassword("admin123");
    } else {
      setEmail("user@demo.com");
      setPassword("user123");
    }
    setError("");
  }

  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    setError("");
    try {
      const tokenData = await googleLogin(tokenResponse.access_token);
      localStorage.setItem("crm_token", tokenData.access_token);
      const userData = await getMe();
      loginSuccess(tokenData.access_token, userData);
      navigate(userData.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const signInWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google sign-in was cancelled or failed."),
  });

  const isGoogleConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

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

          {/* Google Sign-In */}
          {isGoogleConfigured && (
            <>
              <button
                id="google-signin-btn"
                type="button"
                onClick={() => signInWithGoogle()}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-2.5
                           text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300
                           transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {/* Google "G" logo SVG */}
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 2.9l5.7-5.7C33.9 6.3 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.4-4z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 2.9l5.7-5.7C33.9 6.3 29.2 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.8-1.9 13.3-5l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.4-11.2-8.1l-6.5 5C9.8 39.6 16.4 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.2 5.2C40.9 35.1 44 29.9 44 24c0-1.3-.1-2.7-.4-4z"/>
                </svg>
                {googleLoading ? "Signing in…" : "Continue with Google"}
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </>
          )}

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

        {/* Demo credentials helper */}
        <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <p className="text-xs text-gray-500 font-medium mb-2">Demo credentials</p>
          <div className="flex gap-2">
            <button
              id="fill-user-demo"
              type="button"
              onClick={() => fillDemo("user")}
              className="flex-1 text-xs border border-gray-200 rounded-lg py-2 text-gray-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all"
            >
              User login
            </button>
            <button
              id="fill-admin-demo"
              type="button"
              onClick={() => fillDemo("admin")}
              className="flex-1 text-xs border border-gray-200 rounded-lg py-2 text-gray-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all"
            >
              Admin login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
