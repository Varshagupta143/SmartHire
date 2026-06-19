import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ResumeUploadModal from "../components/ResumeUploadModal";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
export default function JobDetails() {
  /*
    Your route in AppRouter.jsx is:

    path="/user/jobs/:jobId"

    So here we must use jobId.
    Not id.
  */
  const { jobId } = useParams();

  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);

  /*
    We store the full application object.

    Why?
    Because we need:
    - application status: PENDING / ACCEPTED / REJECTED
    - match score
  */
  const [application, setApplication] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    setLoading(true);
    setError("");

    try {
      /*
        Important:

        We use GET /jobs/{jobId}, not GET /jobs.

        Why?
        /jobs now returns only OPEN jobs for candidate dashboard.

        But this page may be opened using an old/direct link.
        Example:
        /user/jobs/abc123

        Even if the job is CLOSED, we still want to show details
        with message: "This job is closed".
      */
      const jobRes = await API.get(`/jobs/${jobId}`);
      setJob(jobRes.data);

      /*
        Load current candidate's applications.

        This tells us:
        - whether candidate already applied
        - application status
        - match score
      */
      if (user?.id) {
        const appsRes = await API.get("/applications/me");

        const foundApplication = appsRes.data.find(
          (app) => app.jobId === jobId
        );

        setApplication(foundApplication || null);
      }
    } catch (err) {
      console.error("Failed to load job details:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load job details"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    Application status badge color.
  */
  const getApplicationStatusBadge = (status) => {
    if (status === "ACCEPTED") return "bg-success";
    if (status === "REJECTED") return "bg-danger";
    return "bg-warning text-dark";
  };

  /*
    Old jobs in MongoDB may not have status field.
    So if status is missing, we treat it as OPEN.
  */
  const jobStatus = job?.status || "OPEN";
  const isClosed = jobStatus === "CLOSED";

  const applied = !!application;

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary" />
          <p className="text-muted mt-2">Loading job details...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <div className="container mt-5" style={{ maxWidth: 760 }}>
          <div className="alert alert-danger">{error}</div>

          <button
            className="btn btn-link text-decoration-none ps-0"
            onClick={() => navigate("/user")}
          >
            ← Back to Jobs
          </button>
        </div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />

        <div className="container mt-5 text-center text-muted">
          Job not found.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container mt-4 pb-5" style={{ maxWidth: 760 }}>
        <button
          className="btn btn-link text-decoration-none ps-0 mb-3"
          onClick={() => navigate("/user")}
        >
          ← Back to Jobs
        </button>

        {toast && <div className="alert alert-success py-2">{toast}</div>}

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <h2 className="mb-1">{job.title}</h2>

                <p className="text-muted mb-0">
                  🏢 {job.company}
                  {job.location && <> &nbsp;·&nbsp; 📍 {job.location}</>}
                </p>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                {/* Job OPEN/CLOSED status */}
                <span
                  className={`badge fs-6 py-2 px-3 ${
                    isClosed ? "bg-secondary" : "bg-success"
                  }`}
                >
                  {jobStatus}
                </span>

                {/* Applied badge */}
                {applied && (
                  <span className="badge bg-primary fs-6 py-2 px-3">
                    ✓ Applied
                  </span>
                )}
              </div>
            </div>

            {/* Closed job warning */}
            {isClosed && (
              <div className="alert alert-secondary py-2">
                This job is closed. Applications are no longer accepted.
              </div>
            )}

            <hr />

            <h5>Job Description</h5>

            <p className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
              {job.description}
            </p>

            <hr />

            <h5>Application Status</h5>

            {applied ? (
              <div className="alert alert-info">
                <p className="mb-1">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`badge ${getApplicationStatusBadge(
                      application.status
                    )}`}
                  >
                    {application.status || "PENDING"}
                  </span>
                </p>

                <p className="mb-0">
                  <strong>Match Score:</strong>{" "}
                  {application.matchScore || 0}%
                </p>

                {application.status === "ACCEPTED" && (
                  <div className="alert alert-success mt-3 mb-0">
                    🎉 Congratulations! Your application has been accepted.
                    HR may contact you for the next round.
                  </div>
                )}

                {application.status === "REJECTED" && (
                  <div className="alert alert-danger mt-3 mb-0">
                    Your application was not selected for this job.
                  </div>
                )}

                {(!application.status || application.status === "PENDING") && (
                  <div className="alert alert-warning mt-3 mb-0">
                    Your application is under review. Please wait for HR
                    response.
                  </div>
                )}
              </div>
            ) : (
              <>
                {isClosed ? (
                  <p className="text-muted">
                    You have not applied for this job, and this job is now
                    closed.
                  </p>
                ) : (
                  <div>
                    <p className="text-muted">
                      You have not applied for this job yet.
                    </p>

                    <button
                      className="btn btn-primary"
                      onClick={() => setShowModal(true)}
                    >
                      Apply Now
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ResumeUploadModal
          userId={user?.id}
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setToast("Application submitted successfully!");

            /*
              Reload details after successful apply
              so status and match score appear immediately.
            */
            loadJobDetails();
          }}
        />
      )}
   <Footer />
    </>
  );
}