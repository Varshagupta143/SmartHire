import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = (user?.role || "").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-4 d-flex justify-content-between align-items-center" style={{ minHeight: 56 }}>
      <Link className="navbar-brand fw-bold fs-4 text-decoration-none" to="/">
        <span className="text-primary">Smart</span>
        <span className="text-white">Hire</span>
      </Link>

      <div className="d-flex align-items-center gap-2">
        {user ? (
          <>
            <span className="text-light small me-1">
              {user.name || user.email}
              <span className="badge bg-secondary ms-2">{role}</span>
            </span>

            {(role === "USER" || role === "CANDIDATE") && (
              <Link className="btn btn-outline-light btn-sm" to="/user">Dashboard</Link>
            )}
            {role === "HR" && (
              <Link className="btn btn-outline-light btn-sm" to="/hr">HR Dashboard</Link>
            )}
            {role === "ADMIN" && (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/admin">Admin</Link>
                <Link className="btn btn-outline-light btn-sm" to="/hr">HR View</Link>
              </>
            )}

            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
            <Link className="btn btn-outline-light btn-sm" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
