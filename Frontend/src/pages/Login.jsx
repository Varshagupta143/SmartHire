import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    setError(""); setLoading(true);
    try {
      const res = await API.post("/users/login", { email, password });
      login(res.data);
      const role = (res.data.role || "").toUpperCase();
      if (role === "ADMIN") nav("/admin");
      else if (role === "HR") nav("/hr");
      else nav("/user");
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
      <div className="card p-4 shadow-lg" style={{ width: "100%", maxWidth: 420 }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1">
            <span className="text-primary">Smart</span>Hire
          </h2>
          <p className="text-muted mb-0">Sign in to your account</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <label className="form-label">Email</label>
        <input
          className="form-control mb-3" type="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <label className="form-label">Password</label>
        <input
          className="form-control mb-4" type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <button className="btn btn-primary w-100 py-2" onClick={handleLogin} disabled={loading}>
          {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</> : "Sign In"}
        </button>

        <p className="text-center mt-3 mb-0 text-muted small">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary text-decoration-none fw-semibold">Register here</Link>
        </p>
      </div>
    </div>
  );
}
