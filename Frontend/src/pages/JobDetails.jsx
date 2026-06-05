import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const jobRes = await API.get(`/jobs/${jobId}`);
      setJob(jobRes.data);

      const appsRes = await API.get("/applications/me");
      setMyApplications(appsRes.data);
    } catch (err) {
      console.error("Failed to load job details:", err);
      setError(err.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const appliedApplication = myApplications.find(
    (app) => app.jobId === jobId
  );

  const getStatusBadgeClass = (status) => {
    if (status === "ACCEPTED") return "bg-success";
    if (status === "REJECTED") return "bg-danger";
    return "bg-warning text-dark";
  };

  return (
    <>
      <Navbar />

      <div className="container mt-4 pb-5">
        <button
          className="btn btn-link ps-0 text-decoration-none mb-3"
          onClick={() => navigate("/user")}
        >
          ← Back to Dashboard
        </button>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="mt-2 text-muted">Loading job details...</p>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && job && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                <div>
                  <h2>{job.title}</h2>

                  <p className="text-muted mb-0">
                    🏢 {job.company}
                    {job.location && <> · 📍 {job.location}</>}
                  </p>
                </div>

                {appliedApplication ? (
                  <span className="badge bg-success fs-6">Applied</span>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/user")}
                  >
                    Apply Now
                  </button>
                )}
              </div>

              <hr />

              <h5>Job Description</h5>

              <p style={{ whiteSpace: "pre-wrap" }}>
                {job.description}
              </p>

              <hr />

              <h5>Application Status</h5>

              {appliedApplication ? (
                <div className="alert alert-info">
                  <p className="mb-1">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${getStatusBadgeClass(
                        appliedApplication.status
                      )}`}
                    >
                      {appliedApplication.status || "PENDING"}
                    </span>
                  </p>

                  <p className="mb-0">
                    <strong>Match Score:</strong>{" "}
                    {appliedApplication.matchScore || 0}%
                  </p>

                  {appliedApplication.status === "ACCEPTED" && (
                    <div className="alert alert-success mt-3 mb-0">
                      🎉 Congratulations! Your application has been accepted.
                      HR may contact you for the next round.
                    </div>
                  )}

                  {appliedApplication.status === "REJECTED" && (
                    <div className="alert alert-danger mt-3 mb-0">
                      Your application was not selected for this job.
                    </div>
                  )}

                  {(!appliedApplication.status ||
                    appliedApplication.status === "PENDING") && (
                    <div className="alert alert-warning mt-3 mb-0">
                      Your application is under review. Please wait for HR
                      response.
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted">
                  You have not applied for this job yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}