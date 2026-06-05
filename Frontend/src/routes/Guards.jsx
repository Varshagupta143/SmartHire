import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || "").toUpperCase();

  if (!allowedRoles.includes(role)) {
    if (role === "ADMIN") return <Navigate to="/admin" replace />;
    if (role === "HR") return <Navigate to="/hr" replace />;
    return <Navigate to="/user" replace />;
  }

  return children;
}