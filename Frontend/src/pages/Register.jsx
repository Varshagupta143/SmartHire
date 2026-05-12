import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("All fields are required."); return; }
    setError(""); setLoading(true);
    try {
      await API.post("/users/register", { name, email, password, role });
      alert("Registered successfully! Please log in.");
      nav("/login");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
      <div className="card p-4 shadow-lg" style={{ width: "100%", maxWidth: 440 }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1"><span className="text-primary">Smart</span>Hire</h2>
          <p className="text-muted mb-0">Create your account</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <label className="form-label">Full Name</label>
        <input className="form-control mb-3" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="form-label">Email</label>
        <input className="form-control mb-3" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="form-label">Password</label>
        <input className="form-control mb-3" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />

        <label className="form-label">Account Type</label>
        <select className="form-select mb-4" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="USER">Job Seeker / Candidate</option>
          <option value="HR">HR Manager</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button className="btn btn-success w-100 py-2" onClick={handleRegister} disabled={loading}>
          {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating account…</> : "Create Account"}
        </button>

        <p className="text-center mt-3 mb-0 text-muted small">
          Already have an account?{" "}
          <Link to="/login" className="text-primary text-decoration-none fw-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
