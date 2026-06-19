import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/forgot-password", { email });

      setMessage(
        res.data.message ||
          "Password reset link has been sent to your email."
      );

      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}
    >
      <div className="card p-4 shadow-lg" style={{ width: "100%", maxWidth: 420 }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1">
            <span className="text-primary">Smart</span>Hire
          </h2>
          <h4 className="mb-1">Forgot Password</h4>
          <p className="text-muted mb-0">
            Enter your registered email. We will send you a password reset link.
          </p>
        </div>

        {message && <div className="alert alert-success py-2">{message}</div>}
        {error && <div className="alert alert-danger py-2">{error}</div>}

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <label className="form-label">Email</label>

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Enter registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button className="btn btn-primary w-100 py-2" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-muted small">
              Please check your inbox or spam folder for the reset link.
            </p>

            <button
              className="btn btn-outline-primary w-100 mb-3"
              onClick={() => {
                setSent(false);
                setMessage("");
                setError("");
              }}
            >
              Send Again
            </button>
          </div>
        )}

        <div className="text-center mt-3">
          <Link to="/login" className="text-primary text-decoration-none fw-semibold">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}