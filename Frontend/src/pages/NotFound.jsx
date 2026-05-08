import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();
  const role = (user?.role || "").toUpperCase();
  const home = role === "ADMIN" ? "/admin" : role === "HR" ? "/hr" : user ? "/user" : "/login";

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center text-center">
      <div>
        <div style={{ fontSize: "5rem" }}>🔍</div>
        <h1 className="display-4 fw-bold mt-2">404</h1>
        <p className="lead text-muted">Page not found.</p>
        <Link to={home} className="btn btn-primary mt-2">Go to Dashboard</Link>
      </div>
    </div>
  );
}
