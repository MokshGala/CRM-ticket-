import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute, AdminRoute } from "./components/PrivateRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard";
import CreateTicketPage from "./pages/CreateTicketPage";
import UserTicketDetail from "./pages/UserTicketDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTicketDetail from "./pages/AdminTicketDetail";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets/create"
            element={
              <PrivateRoute>
                <CreateTicketPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets/:ticketId"
            element={
              <PrivateRoute>
                <UserTicketDetail />
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/tickets/:ticketId"
            element={
              <AdminRoute>
                <AdminTicketDetail />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
