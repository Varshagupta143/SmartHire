import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const redirectByRole = (user) => {
    const role = (user.role || "").toUpperCase();

    if (role === "ADMIN") navigate("/admin");
    else if (role === "HR") navigate("/hr");
    else navigate("/user");
  };

  useEffect(() => {
    handleOAuthSuccess();
  }, []);

  const handleOAuthSuccess = async () => {
    const token = searchParams.get("token");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      setError(oauthError);
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Google login failed. Token not found.");
      setLoading(false);
      return;
    }

    try {
      localStorage.setItem("token", token);

      const userRes = await API.get("/users/me");

      login({
        token,
        user: userRes.data,
      });

      redirectByRole(userRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to complete Google login"
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}
    >
      <div className="card p-4 shadow-lg text-center" style={{ maxWidth: 420 }}>
        {loading ? (
          <>
            <div className="spinner-border text-primary mx-auto mb-3" />
            <h5>Completing Google login...</h5>
            <p className="text-muted mb-0">Please wait.</p>
          </>
        ) : (
          <>
            <div className="alert alert-danger">{error}</div>

            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}