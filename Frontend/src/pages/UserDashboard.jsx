import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ResumeUploadModal from "../components/ResumeUploadModal";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [applyModal, setApplyModal] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      const jobsRes = await API.get("/jobs");
      setJobs(jobsRes.data);

      try {
        const appsRes = await API.get("/applications/me");
        setMyApplications(appsRes.data);
      } catch (err) {
        console.error("Failed to load my applications:", err);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const getApplicationForJob = (jobId) => {
    return myApplications.find((app) => app.jobId === jobId);
  };

  const getStatusBadgeClass = (status) => {
    if (status === "ACCEPTED") return "bg-success";
    if (status === "REJECTED") return "bg-danger";
    return "bg-warning text-dark";
  };

  const filtered = jobs.filter(
    (j) =>
      !search ||
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase()) ||
      j.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <div className="container mt-4 pb-5">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
          <div>
            <h3 className="mb-0">
              Welcome back, {user?.name || "Candidate"} 👋
            </h3>
            <p className="text-muted mb-0">
              Browse open positions and apply with your resume.
            </p>
          </div>

          <span className="badge bg-primary fs-6 py-2 px-3">
            {myApplications.length} Applied
          </span>
        </div>

        {toast && (
          <div className="alert alert-success alert-dismissible py-2" role="alert">
            {toast}
          </div>
        )}

        <div className="mb-4">
          <input
            className="form-control"
            placeholder="🔍 Search by title, company or keywords…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 500 }}
          />
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="mt-2 text-muted">Loading jobs…</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-5 text-muted">
            <div className="fs-1">💼</div>
            <p>
              {search
                ? "No jobs match your search."
                : "No jobs posted yet. Check back soon!"}
            </p>
          </div>
        )}

        <div className="row g-3">
          {filtered.map((job) => {
            const application = getApplicationForJob(job.id);

            return (
              <div className="col-md-6 col-lg-4" key={job.id}>
                <div className="card h-100 shadow-sm job-card">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <h5 className="card-title mb-1">{job.title}</h5>

                      {application && (
                        <span
                          className={`badge ${getStatusBadgeClass(
                            application.status
                          )}`}
                        >
                          {application.status || "PENDING"}
                        </span>
                      )}
                    </div>

                    <h6 className="card-subtitle text-muted mb-2 small">
                      🏢 {job.company}
                      {job.location && <> · 📍 {job.location}</>}
                    </h6>

                    <p
                      className="card-text text-muted small flex-grow-1"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {job.description}
                    </p>

                    {application && (
                      <div className="mb-2 small">
                        <span className="text-muted">Match Score: </span>
                        <strong>{application.matchScore || 0}%</strong>
                      </div>
                    )}

                    <div className="mt-3 d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm flex-grow-1"
                        onClick={() =>
                          navigate(`/user/jobs/${job.id}`, { state: { job } })
                        }
                      >
                        View Details
                      </button>

                      {application ? (
                        <span className="btn btn-success btn-sm flex-grow-1 disabled">
                          ✓ Applied
                        </span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm flex-grow-1"
                          onClick={() =>
                            setApplyModal({
                              id: job.id,
                              title: job.title,
                            })
                          }
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {applyModal && (
        <ResumeUploadModal
          userId={user?.id}
          jobId={applyModal.id}
          jobTitle={applyModal.title}
          onClose={() => setApplyModal(null)}
          onSuccess={() => {
            setMyApplications((prev) => [
              ...prev,
              {
                jobId: applyModal.id,
                status: "PENDING",
                matchScore: 0,
              },
            ]);

            setApplyModal(null);
            showToast(`Applied to "${applyModal.title}" successfully!`);

            loadDashboardData();
          }}
        />
      )}
    </>
  );
}