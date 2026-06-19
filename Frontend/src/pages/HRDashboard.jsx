import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import Footer from "../components/Footer";
export default function HRDashboard() {
  const [jobs, setJobs] = useState([]);
  const [appCounts, setAppCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [jobFilter, setJobFilter] = useState("ALL");
  /*
    jobForm is used for both:
    1. Posting a new job
    2. Editing an existing job

    If editingJobId is null   → form is in POST mode
    If editingJobId has value → form is in EDIT mode
  */
  const [editingJobId, setEditingJobId] = useState(null);

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
      /*
        HR should see only their own jobs.
        Backend returns both OPEN and CLOSED jobs posted by this HR.
      */
      const jobsRes = await API.get("/jobs/my-jobs");

      setJobs(jobsRes.data);

      /*
        Count applicants for each HR job.
        Even CLOSED jobs can have old applicants, so we still count them.
      */
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
      setError(err.response?.data?.message || err.message || "Failed to load HR data");
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

  const resetForm = () => {
    setEditingJobId(null);
    setJobForm({
      title: "",
      company: "",
      location: "",
      description: "",
    });
  };

  /*
    This handles both create and update.

    POST mode:
    - editingJobId is null
    - API.post("/jobs", jobForm)

    EDIT mode:
    - editingJobId has job id
    - API.put(`/jobs/${editingJobId}`, jobForm)
  */
  const handleSubmitJob = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      if (editingJobId) {
        await API.put(`/jobs/${editingJobId}`, jobForm);
        setMessage("Job updated successfully");
      } else {
        await API.post("/jobs", jobForm);
        setMessage("Job posted successfully");
      }

      resetForm();
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          (editingJobId ? "Failed to update job" : "Failed to post job")
      );
    }
  };

  /*
    When HR clicks Edit, we fill the form with old job data.
    Then the same form becomes Update Job form.
  */
  const handleEditClick = (job) => {
    setEditingJobId(job.id);

    setJobForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      description: job.description || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /*
    Closing job does not delete it.
    It only changes status from OPEN to CLOSED.

    CLOSED jobs:
    - are hidden from candidate dashboard
    - cannot be applied to
    - remain visible to HR/Admin
  */
  const handleCloseJob = async (jobId) => {
    const ok = window.confirm("Are you sure you want to close this job?");
    if (!ok) return;

    setMessage("");
    setError("");

    try {
      await API.patch(`/jobs/${jobId}/close`);
      setMessage("Job closed successfully");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to close job");
    }
  };

  /*
    Reopening changes status from CLOSED to OPEN.
    After reopening, candidates can see/apply again.
  */
  const handleReopenJob = async (jobId) => {
    const ok = window.confirm("Do you want to reopen this job?");
    if (!ok) return;

    setMessage("");
    setError("");

    try {
      await API.patch(`/jobs/${jobId}/reopen`);
      setMessage("Job reopened successfully");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to reopen job");
    }
  };

  const totalApps = Object.values(appCounts).reduce((a, b) => a + b, 0);

  const openJobs = jobs.filter((job) => (job.status || "OPEN") === "OPEN");
  const closedJobs = jobs.filter((job) => job.status === "CLOSED");
  const filteredJobs = jobs.filter((job) => {
    const status = job.status || "OPEN";

    if (jobFilter === "OPEN") {
      return status === "OPEN";
    }

    if (jobFilter === "CLOSED") {
      return status === "CLOSED";
    }

    return true;
  });
  return (
    <>
      <Navbar />

      <div className="container mt-4 pb-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="mb-0">HR Dashboard</h3>
            <p className="text-muted mb-0">
              Post jobs, edit jobs, close/reopen jobs, and review applicants.
            </p>
          </div>

          <div className="d-flex gap-3 flex-wrap">
            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-primary">{jobs.length}</div>
              <div className="text-muted small">My Jobs</div>
            </div>

            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-success">{openJobs.length}</div>
              <div className="text-muted small">Open Jobs</div>
            </div>

            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-secondary">{closedJobs.length}</div>
              <div className="text-muted small">Closed Jobs</div>
            </div>

            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-success">{totalApps}</div>
              <div className="text-muted small">Applicants</div>
            </div>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Create / Edit Job Form */}
        <div className="card border-0 shadow-sm p-4 mb-5">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h4 className="mb-0">
              {editingJobId ? "Edit Job" : "Post a New Job"}
            </h4>

            {editingJobId && (
              <button className="btn btn-outline-secondary btn-sm" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitJob}>
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
              {editingJobId ? "Update Job" : "Post Job"}
            </button>
          </form>
        </div>

        {/* My Jobs */}
       <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
         <h4 className="mb-0">My Posted Jobs</h4>

         <div className="d-flex gap-2 flex-wrap">
           <button
             className={`btn btn-sm ${
               jobFilter === "ALL" ? "btn-primary" : "btn-outline-primary"
             }`}
             onClick={() => setJobFilter("ALL")}
           >
             All ({jobs.length})
           </button>

           <button
             className={`btn btn-sm ${
               jobFilter === "OPEN" ? "btn-success" : "btn-outline-success"
             }`}
             onClick={() => setJobFilter("OPEN")}
           >
             Open ({openJobs.length})
           </button>

           <button
             className={`btn btn-sm ${
               jobFilter === "CLOSED" ? "btn-secondary" : "btn-outline-secondary"
             }`}
             onClick={() => setJobFilter("CLOSED")}
           >
             Closed ({closedJobs.length})
           </button>
         </div>
       </div>
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="mt-2 text-muted">Loading jobs…</p>
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-5 text-muted">
            <div className="fs-1">📋</div>
            <p>
              {jobFilter === "ALL"
                ? "No jobs posted yet. Post your first job above."
                : `No ${jobFilter.toLowerCase()} jobs found.`}
            </p>
          </div>
        )}

        {!loading && filteredJobs.length > 0 && (
          <div className="row g-3">
            {filteredJobs.map((job) => {
              const count = appCounts[job.id] || 0;
              const status = job.status || "OPEN";
              const isClosed = status === "CLOSED";

              return (
                <div className="col-md-6 col-lg-4" key={job.id}>
                  <div className="card h-100 shadow-sm job-card">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                        <h5 className="card-title mb-0">{job.title}</h5>

                        <span
                          className={`badge ${
                            isClosed ? "bg-secondary" : "bg-success"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="mb-2">
                        <span
                          className={`badge ${
                            count > 0 ? "bg-primary" : "bg-light text-dark border"
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

                      {isClosed && (
                        <div className="alert alert-secondary py-2 small">
                          This job is closed. Candidates cannot apply.
                        </div>
                      )}

                      <div className="d-grid gap-2 mt-3">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            navigate(`/hr/jobs/${job.id}`, { state: { job } })
                          }
                        >
                          View Applicants & Rankings →
                        </button>

                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => handleEditClick(job)}
                        >
                          Edit Job
                        </button>

                        {isClosed ? (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleReopenJob(job.id)}
                          >
                            Reopen Job
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleCloseJob(job.id)}
                          >
                            Close Job
                          </button>
                        )}
                      </div>
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