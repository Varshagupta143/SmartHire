import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  // New job form
  const [form, setForm] = useState({ title: "", company: "", location: "", description: "" });
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null); // jobId
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { loadJobs(); loadUsers(); }, []);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try { const r = await API.get("/jobs"); setJobs(r.data); }
    catch (e) { console.error(e); }
    finally { setLoadingJobs(false); }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try { const r = await API.get("/users"); setUsers(r.data); }
    catch (e) { console.error(e); }
    finally { setLoadingUsers(false); }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  };

  const handleFormChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const createJob = async () => {
    if (!form.title || !form.company || !form.description) {
      setFormError("Title, company, and description are required.");
      return;
    }
    setFormError(""); setCreating(true);
    try {
      await API.post("/jobs", form);
      setForm({ title: "", company: "", location: "", description: "" });
      await loadJobs();
      showToast("Job posted successfully!");
    } catch (err) {
      setFormError(err.message || "Failed to create job.");
    } finally {
      setCreating(false);
    }
  };

  const deleteJob = async (jobId) => {
    setDeleting(jobId);
    try {
      await API.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setDeleteConfirm(null);
      showToast("Job deleted.", "warning");
    } catch (err) {
      showToast("Failed to delete job: " + err.message, "danger");
    } finally {
      setDeleting(null);
    }
  };

  const roleColor = { ADMIN: "danger", HR: "info", USER: "secondary", CANDIDATE: "secondary" };

  return (
    <>
      <Navbar />
      <div className="container mt-4 pb-5">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="mb-0">Admin Dashboard</h3>
            <p className="text-muted mb-0">Manage jobs and users across the platform.</p>
          </div>
          <div className="d-flex gap-3">
            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-primary">{jobs.length}</div>
              <div className="text-muted small">Jobs</div>
            </div>
            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-success">{users.length}</div>
              <div className="text-muted small">Users</div>
            </div>
          </div>
        </div>

        {toast.msg && (
          <div className={`alert alert-${toast.type} py-2`}>{toast.msg}</div>
        )}

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          {[["jobs", "💼 Manage Jobs"], ["users", "👥 All Users"]].map(([id, label]) => (
            <li className="nav-item" key={id}>
              <button
                className={`nav-link ${activeTab === id ? "active fw-semibold" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                {label} {id === "jobs" ? `(${jobs.length})` : `(${users.length})`}
              </button>
            </li>
          ))}
        </ul>

        {/* ── JOBS TAB ── */}
        {activeTab === "jobs" && (
          <>
            {/* Post Job Form */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">Post a New Job</h5>
              </div>
              <div className="card-body">
                {formError && <div className="alert alert-danger py-2">{formError}</div>}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Job Title <span className="text-danger">*</span></label>
                    <input className="form-control" name="title" placeholder="e.g. Senior React Developer" value={form.title} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Company <span className="text-danger">*</span></label>
                    <input className="form-control" name="company" placeholder="e.g. Acme Corp" value={form.company} onChange={handleFormChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Location</label>
                    <input className="form-control" name="location" placeholder="e.g. Remote / Mumbai" value={form.location} onChange={handleFormChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control" name="description" rows={4}
                      placeholder="Describe the role, responsibilities, required skills…"
                      value={form.description} onChange={handleFormChange}
                    />
                    <div className="form-text">💡 A detailed description improves ML ranking accuracy.</div>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary px-4" onClick={createJob} disabled={creating}>
                      {creating ? <><span className="spinner-border spinner-border-sm me-2" />Posting…</> : "Post Job"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">Posted Jobs ({jobs.length})</h5>
              </div>
              <div className="card-body p-0">
                {loadingJobs ? (
                  <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
                ) : jobs.length === 0 ? (
                  <p className="text-muted text-center py-4">No jobs posted yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Title</th>
                          <th>Company</th>
                          <th>Location</th>
                          <th>Description</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job) => (
                          <tr key={job.id}>
                            <td className="fw-semibold">{job.title}</td>
                            <td>{job.company}</td>
                            <td><span className="text-muted">{job.location || "—"}</span></td>
                            <td>
                              <span className="text-muted small" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", maxWidth: 260 }}>
                                {job.description}
                              </span>
                            </td>
                            <td>
                              {deleteConfirm === job.id ? (
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-danger btn-sm"
                                    disabled={deleting === job.id}
                                    onClick={() => deleteJob(job.id)}
                                  >
                                    {deleting === job.id ? "…" : "Confirm"}
                                  </button>
                                  <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(null)}>
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => setDeleteConfirm(job.id)}
                                >
                                  🗑 Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Registered Users ({users.length})</h5>
            </div>
            <div className="card-body p-0">
              {loadingUsers ? (
                <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
              ) : users.length === 0 ? (
                <p className="text-muted text-center py-4">No users found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Resume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id}>
                          <td className="text-muted small">{i + 1}</td>
                          <td className="fw-semibold">{u.name || "—"}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge bg-${roleColor[u.role?.toUpperCase()] || "secondary"}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {u.resumeContent
                              ? <span className="badge bg-success">✓ Uploaded</span>
                              : <span className="badge bg-light text-muted border">None</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
