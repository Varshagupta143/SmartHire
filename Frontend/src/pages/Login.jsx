import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /*
    OTP login states
  */
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");

  /*
    OTP timer.
    Backend OTP is valid for 5 minutes.
    So frontend countdown starts from 300 seconds.
  */
  const [otpTimer, setOtpTimer] = useState(0);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();

  /*
    Countdown effect.

    When otpRequired is true and timer > 0,
    timer decreases every second.
  */
  useEffect(() => {
    if (!otpRequired || otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpRequired, otpTimer]);

  const redirectByRole = (user) => {
    const role = (user.role || "").toUpperCase();

    if (role === "ADMIN") nav("/admin");
    else if (role === "HR") nav("/hr");
    else nav("/user");
  };

  /*
    Step 1:
    Email + password login.

    Backend checks password.
    If correct, backend sends OTP.
    JWT is not returned yet.
  */
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await API.post("/users/login", {
        email,
        password,
      });

      if (res.data.otpRequired) {
        setOtpRequired(true);
        setOtpEmail(res.data.email);
        setOtp("");
        setOtpTimer(300); // 5 minutes
        setMessage(res.data.message || "OTP sent to your email");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    Step 2:
    Verify OTP.

    If OTP is correct, backend returns JWT + user.
  */
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter OTP.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await API.post("/users/verify-otp", {
        email: otpEmail,
        otp,
      });

      login(res.data);
      redirectByRole(res.data.user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    Resend OTP.

    We call /users/login again using same email/password.
    Backend verifies password again and sends a fresh OTP.
  */
  const handleResendOtp = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      const res = await API.post("/users/login", {
        email,
        password,
      });

      setOtp("");
      setOtpTimer(300);
      setMessage(res.data.message || "New OTP sent to your email");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to resend OTP."
      );
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = () => {
    setOtpRequired(false);
    setOtp("");
    setOtpEmail("");
    setOtpTimer(0);
    setMessage("");
    setError("");
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${min}:${sec.toString().padStart(2, "0")}`;
  };
  const handleGoogleLogin = () => {
    const apiBaseUrl =
      import.meta.env.VITE_API_URL || "http://localhost:8080/api";

    const backendBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");

    window.location.href = `${backendBaseUrl}/oauth2/authorization/google`;
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

          <p className="text-muted mb-0">
            {otpRequired ? "Verify OTP to continue" : "Sign in to your account"}
          </p>
        </div>

        {message && <div className="alert alert-success py-2">{message}</div>}
        {error && <div className="alert alert-danger py-2">{error}</div>}

        {!otpRequired ? (
          <>
            <label className="form-label">Email</label>
            <input
              className="form-control mb-3"
              type="email"
              placeholder="you@example.com"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            <label className="form-label">Password</label>
            <input
              className="form-control mb-2"
              type="password"
              placeholder="Password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            <div className="text-end mb-4">
              <Link
                to="/forgot-password"
                className="text-primary text-decoration-none small fw-semibold"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              className="btn btn-primary w-100 py-2"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Sending OTP…
                </>
              ) : (
                "Sign In"
              )}
            </button>
               <div className="d-flex align-items-center my-3">
                 <hr className="flex-grow-1" />
                 <span className="mx-2 text-muted small">OR</span>
                 <hr className="flex-grow-1" />
               </div>

               <button
                 className="btn btn-outline-danger w-100 py-2"
                 onClick={handleGoogleLogin}
               >
                 Continue with Google
               </button>
            <p className="text-center mt-3 mb-0 text-muted small">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary text-decoration-none fw-semibold"
              >
                Register here
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="alert alert-info py-2">
              OTP sent to <strong>{otpEmail}</strong>
            </div>

            <div className="text-center mb-3">
              {otpTimer > 0 ? (
                <span className="badge bg-secondary">
                  OTP expires in {formatTime(otpTimer)}
                </span>
              ) : (
                <span className="badge bg-danger">
                  OTP expired. Please resend OTP.
                </span>
              )}
            </div>

            <label className="form-label">Enter OTP</label>
            <input
              className="form-control mb-3"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              maxLength={6}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "");
                setOtp(onlyDigits);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
            />

            <button
              className="btn btn-primary w-100 py-2"
              onClick={handleVerifyOtp}
              disabled={loading || otpTimer <= 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Verifying…
                </>
              ) : (
                "Verify OTP"
              )}
            </button>

            <button
              className="btn btn-outline-primary w-100 mt-2"
              onClick={handleResendOtp}
              disabled={resending}
            >
              {resending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Resending…
                </>
              ) : (
                "Resend OTP"
              )}
            </button>

            <button
              className="btn btn-link w-100 mt-2 text-decoration-none"
              onClick={handleBackToLogin}
              disabled={loading || resending}
            >
              ← Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}