import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function HRDashboard() {
  const [jobs, setJobs] = useState([]);
  const [appCounts, setAppCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      // HR should see only jobs posted by them
      const jobsRes = await API.get("/jobs/my-jobs");

      setJobs(jobsRes.data);

      // Count applicants for each HR job
      const counts = {};

      for (const job of jobsRes.data) {
        try {
          const appsRes = await API.get(`/applications/job/${job.id}`);
          counts[job.id] = appsRes.data.length;
        } catch {
          counts[job.id] = 0;
        }
      }

      setAppCounts(counts);
    } catch (err) {
      console.error("Failed to load HR data:", err);
      setError(err.message || "Failed to load HR data");
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = (e) => {
    setJobForm({
      ...jobForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePostJob = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      await API.post("/jobs", jobForm);

      setMessage("Job posted successfully");

      setJobForm({
        title: "",
        company: "",
        location: "",
        description: "",
      });

      loadData();
    } catch (err) {
      setError(err.message || "Failed to post job");
    }
  };

  const totalApps = Object.values(appCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      <Navbar />

      <div className="container mt-4 pb-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="mb-0">HR Dashboard</h3>
            <p className="text-muted mb-0">
              Post jobs and review applicants for your own jobs.
            </p>
          </div>

          <div className="d-flex gap-3">
            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-primary">{jobs.length}</div>
              <div className="text-muted small">My Jobs</div>
            </div>

            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-success">{totalApps}</div>
              <div className="text-muted small">Applicants</div>
            </div>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Post Job Form */}
        <div className="card border-0 shadow-sm p-4 mb-5">
          <h4 className="mb-3">Post a New Job</h4>

          <form onSubmit={handlePostJob}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Job Title</label>
                <input
                  className="form-control"
                  name="title"
                  value={jobForm.title}
                  onChange={handleJobChange}
                  placeholder="e.g. Java Backend Developer"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Company</label>
                <input
                  className="form-control"
                  name="company"
                  value={jobForm.company}
                  onChange={handleJobChange}
                  placeholder="e.g. Infosys"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Location</label>
              <input
                className="form-control"
                name="location"
                value={jobForm.location}
                onChange={handleJobChange}
                placeholder="e.g. Bengaluru"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={jobForm.description}
                onChange={handleJobChange}
                placeholder="Mention required skills, responsibilities, experience..."
                rows="4"
                required
              />
            </div>

            <button className="btn btn-primary" type="submit">
              Post Job
            </button>
          </form>
        </div>

        {/* My Jobs */}
        <h4 className="mb-3">My Posted Jobs</h4>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="mt-2 text-muted">Loading jobs…</p>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-5 text-muted">
            <div className="fs-1">📋</div>
            <p>No jobs posted yet. Post your first job above.</p>
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
                    onClick={() =>
                      navigate(`/hr/jobs/${job.id}`, { state: { job } })
                    }
                  >
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{job.title}</h5>

                        <span
                          className={`badge ${
                            count > 0 ? "bg-primary" : "bg-secondary"
                          }`}
                        >
                          {count} applicant{count !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <h6 className="card-subtitle text-muted small mb-2">
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