import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Redirect logged-in users away from /login and /register */
export function PublicRoute({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  const role = (user.role || "").toUpperCase();
  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "HR") return <Navigate to="/hr" replace />;
  return <Navigate to="/user" replace />;
}

/** Only allow specific roles; redirect others to their dashboard */
export function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles) {
    const role = (user.role || "").toUpperCase();
    const allowed = allowedRoles.map((r) => r.toUpperCase());
    if (!allowed.includes(role)) {
      if (role === "ADMIN") return <Navigate to="/admin" replace />;
      if (role === "HR") return <Navigate to="/hr" replace />;
      return <Navigate to="/user" replace />;
    }
  }
  return children;
}
