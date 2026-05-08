import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function HRDashboard() {
  const [jobs, setJobs] = useState([]);
  const [appCounts, setAppCounts] = useState({}); // jobId -> count
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        API.get("/jobs"),
        API.get("/applications"),
      ]);
      setJobs(jobsRes.data);

      // Count applications per job
      const counts = {};
      appsRes.data.forEach((app) => {
        counts[app.jobId] = (counts[app.jobId] || 0) + 1;
      });
      setAppCounts(counts);
    } catch (err) {
      console.error("Failed to load HR data:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalApps = Object.values(appCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      <Navbar />
      <div className="container mt-4 pb-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="mb-0">HR Dashboard</h3>
            <p className="text-muted mb-0">Review applicants and manage candidate rankings.</p>
          </div>
          <div className="d-flex gap-3">
            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-primary">{jobs.length}</div>
              <div className="text-muted small">Open Jobs</div>
            </div>
            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-success">{totalApps}</div>
              <div className="text-muted small">Total Applicants</div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="mt-2 text-muted">Loading jobs…</p>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-5 text-muted">
            <div className="fs-1">📋</div>
            <p>No jobs posted yet. Ask an Admin to post jobs.</p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="row g-3">
            {jobs.map((job) => {
              const count = appCounts[job.id] || 0;
              return (
                <div className="col-md-6 col-lg-4" key={job.id}>
                  <div
                    className="card h-100 shadow-sm job-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/hr/jobs/${job.id}`, { state: { job } })}
                  >
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{job.title}</h5>
                        <span className={`badge ${count > 0 ? "bg-primary" : "bg-secondary"}`}>
                          {count} applicant{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <h6 className="card-subtitle text-muted small mb-2">
                        🏢 {job.company}
                        {job.location && <> · 📍 {job.location}</>}
                      </h6>
                      <p
                        className="card-text text-muted small flex-grow-1"
                        style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {job.description}
                      </p>
                      <button
                        className="btn btn-outline-primary btn-sm mt-3 w-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/hr/jobs/${job.id}`, { state: { job } });
                        }}
                      >
                        View Applicants & Rankings →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
