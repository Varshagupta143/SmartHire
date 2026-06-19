import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import Footer from "../components/Footer";
export default function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyApplications();
  }, []);

  const loadMyApplications = async () => {
    setLoading(true);
    setError("");

    try {
      /*
        Step 1:
        Get all applications of logged-in candidate.

        This API returns data like:
        {
          id,
          jobId,
          userId,
          matchScore,
          status
        }
      */
      const appsRes = await API.get("/applications/me");
      const apps = appsRes.data;

      /*
        Step 2:
        Each application has only jobId.
        So we fetch job details for each application.

        Why?
        Because candidate needs to see:
        - job title
        - company
        - location
        - job status OPEN/CLOSED
      */
      const enrichedApplications = await Promise.all(
        apps.map(async (app) => {
          try {
            const jobRes = await API.get(`/jobs/${app.jobId}`);

            return {
              ...app,
              job: jobRes.data,
            };
          } catch (err) {
            /*
              If job is deleted or not found, we still show application record.
              This prevents whole page from breaking.
            */
            return {
              ...app,
              job: null,
            };
          }
        })
      );

      setApplications(enrichedApplications);
    } catch (err) {
      console.error("Failed to load my applications:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === "ACCEPTED") return "bg-success";
    if (status === "REJECTED") return "bg-danger";
    return "bg-warning text-dark";
  };

  return (
    <>
      <Navbar />

      <div className="container mt-4 pb-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="mb-0">My Applications</h3>
            <p className="text-muted mb-0">
              Track all jobs you have applied for.
            </p>
          </div>

          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/user")}
          >
            ← Back to Jobs
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="mt-2 text-muted">Loading applications...</p>
          </div>
        )}

        {!loading && applications.length === 0 && (
          <div className="card border-0 shadow-sm p-5 text-center text-muted">
            <div className="fs-1">📄</div>
            <h5 className="mt-3">No applications yet</h5>
            <p>You have not applied to any job yet.</p>

            <button
              className="btn btn-primary mt-2"
              onClick={() => navigate("/user")}
            >
              Browse Jobs
            </button>
          </div>
        )}

        {!loading && applications.length > 0 && (
          <div className="row g-3">
            {applications.map((app) => {
              const job = app.job;
              const appStatus = app.status || "PENDING";
              const jobStatus = job?.status || "OPEN";
              const isClosed = jobStatus === "CLOSED";

              return (
                <div className="col-md-6 col-lg-4" key={app.id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <h5 className="card-title mb-0">
                          {job?.title || "Job not found"}
                        </h5>

                        <span
                          className={`badge ${getStatusBadgeClass(appStatus)}`}
                        >
                          {appStatus}
                        </span>
                      </div>

                      {job ? (
                        <>
                          <p className="text-muted small mb-2">
                            🏢 {job.company}
                            {job.location && <> · 📍 {job.location}</>}
                          </p>

                          <p
                            className="text-muted small flex-grow-1"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {job.description}
                          </p>

                          <div className="mb-2">
                            <span
                              className={`badge ${
                                isClosed ? "bg-secondary" : "bg-success"
                              }`}
                            >
                              Job {jobStatus}
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted small flex-grow-1">
                          This job may have been removed.
                        </p>
                      )}

                      <div className="border rounded p-2 bg-light mb-3">
                        <div className="small">
                          <strong>Match Score:</strong>{" "}
                          {app.matchScore || 0}%
                        </div>


                      </div>

                      {appStatus === "ACCEPTED" && (
                        <div className="alert alert-success py-2 small">
                          🎉 Congratulations! Your application was accepted.
                        </div>
                      )}

                      {appStatus === "REJECTED" && (
                        <div className="alert alert-danger py-2 small">
                          Your application was rejected for this job.
                        </div>
                      )}

                      {appStatus === "PENDING" && (
                        <div className="alert alert-warning py-2 small">
                          Your application is under review.
                        </div>
                      )}

                      {job && (
                        <button
                          className="btn btn-outline-primary btn-sm mt-auto"
                          onClick={() =>
                            navigate(`/user/jobs/${job.id}`, {
                              state: { job },
                            })
                          }
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
       <Footer />
    </>
  );
}