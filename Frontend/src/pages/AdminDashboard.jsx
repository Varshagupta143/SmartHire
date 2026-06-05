import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function AdminDashboard() {
  const [hr, setHr] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [activeTab, setActiveTab] = useState("createHr");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


const handleHrChange = (field, value) => {
  setHr({
    ...hr,
    [field]: value,
  });
};

  const loadAdminData = async () => {
    try {
      const [usersRes, jobsRes, appsRes] = await Promise.all([
        API.get("/users"),
        API.get("/jobs"),
        API.get("/applications"),
      ]);

      setUsers(usersRes.data);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateHr = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const res = await API.post("/admin/create-hr", hr);

      setMessage(res.data.message || "HR created successfully");

      setHr({
        name: "",
        email: "",
        password: "",
      });

      loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to create HR");
    }
  };

  const hrUsers = users.filter(
    (u) => (u.role || "").toUpperCase() === "HR"
  );

  return (
    <>
      <Navbar />

      <div className="container mt-4 pb-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2>Admin Dashboard</h2>
            <p className="text-muted">
              Manage HR accounts and monitor the platform.
            </p>
          </div>

          <div className="d-flex gap-3">
            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-primary">{hrUsers.length}</div>
              <div className="text-muted small">HR Accounts</div>
            </div>

            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-success">{users.length}</div>
              <div className="text-muted small">Users</div>
            </div>

            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-warning">{jobs.length}</div>
              <div className="text-muted small">Jobs</div>
            </div>

            <div className="card border-0 shadow-sm text-center px-4 py-2">
              <div className="fs-4 fw-bold text-danger">{applications.length}</div>
              <div className="text-muted small">Applications</div>
            </div>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "createHr" ? "active" : ""}`}
              onClick={() => setActiveTab("createHr")}
            >
              Create HR
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              All Users
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "jobs" ? "active" : ""}`}
              onClick={() => setActiveTab("jobs")}
            >
              All Jobs
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => setActiveTab("applications")}
            >
              All Applications
            </button>
          </li>
        </ul>

        {activeTab === "createHr" && (
          <div className="card p-4 shadow-sm">
            <h4>Create HR Account</h4>
             <form onSubmit={handleCreateHr} autoComplete="off">
              <div className="mb-3">
                <label className="form-label">HR Name</label>
               <input
                 className="form-control"
                 name="hrName"
                 value={hr.name}
                 onChange={(e) => handleHrChange("name", e.target.value)}
                 placeholder="e.g. HR Manager"
                 autoComplete="off"
                 required
               />
              </div>

              <div className="mb-3">
                <label className="form-label">HR Email</label>
               <input
                 className="form-control"
                 name="hrEmail"
                 type="email"
                 value={hr.email}
                 onChange={(e) => handleHrChange("email", e.target.value)}
                 placeholder="e.g. hr@company.com"
                 autoComplete="off"
                 required
               />
              </div>

              <div className="mb-3">
                <label className="form-label">HR Password</label>
               <input
                 className="form-control"
                 name="hrPassword"
                 type="password"
                 value={hr.password}
                 onChange={(e) => handleHrChange("password", e.target.value)}
                 placeholder="Create password for HR"
                 autoComplete="new-password"
                 required
               />
              </div>

              <button className="btn btn-primary" type="submit">
                Create HR
              </button>
            </form>
          </div>
        )}

        {activeTab === "users" && (
          <div className="card p-4 shadow-sm">
            <h4>All Users</h4>

            <div className="table-responsive mt-3">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="badge bg-secondary">{u.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="card p-4 shadow-sm">
            <h4>All Jobs</h4>

            {jobs.length === 0 ? (
              <p className="text-muted mt-3">No jobs posted yet.</p>
            ) : (
              jobs.map((job) => (
                <div className="border rounded p-3 mb-3" key={job.id}>
                  <h5>{job.title}</h5>
                  <p className="mb-1">
                    <strong>{job.company}</strong> · {job.location}
                  </p>
                  <p className="text-muted mb-1">{job.description}</p>
                  <small>
                    Posted by: {job.postedByHrEmail || "Old job / not assigned"}
                  </small>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "applications" && (
          <div className="card p-4 shadow-sm">
            <h4>All Applications</h4>

            {applications.length === 0 ? (
              <p className="text-muted mt-3">No applications yet.</p>
            ) : (
              <div className="table-responsive mt-3">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>Application ID</th>
                      <th>Job ID</th>
                      <th>User ID</th>
                      <th>Match Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td>{app.id}</td>
                        <td>{app.jobId}</td>
                        <td>{app.userId}</td>
                        <td>{app.matchScore}</td>
                        <td>
                          <span className="badge bg-info">
                            {app.status || "PENDING"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}