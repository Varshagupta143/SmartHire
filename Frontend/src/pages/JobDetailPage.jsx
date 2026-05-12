import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ResumeUploadModal from "../components/ResumeUploadModal";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function JobDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(location.state?.job || null);
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!job) {
      API.get(`/jobs`).then((r) => {
        const found = r.data.find((j) => j.id === id);
        if (found) setJob(found);
      }).catch(console.error);
    }
    if (user?.id) {
      API.get(`/applications/user/${user.id}`).then((r) => {
        setApplied(r.data.some((a) => a.jobId === id));
      }).catch(() => {});
    }
  }, [id]);

  if (!job) return (
    <>
      <Navbar />
      <div className="container mt-5 text-center"><div className="spinner-border text-primary" /></div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: 760 }}>
        <button className="btn btn-link text-decoration-none ps-0 mb-3" onClick={() => navigate("/user")}>
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
              {applied ? (
                <span className="badge bg-success fs-6 py-2 px-3">✓ Applied</span>
              ) : (
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  Apply Now
                </button>
              )}
            </div>

            <hr />

            <h5>Job Description</h5>
            <p className="text-muted" style={{ whiteSpace: "pre-wrap" }}>{job.description}</p>
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
            setApplied(true);
            setShowModal(false);
            setToast("Application submitted successfully!");
          }}
        />
      )}
    </>
  );
}
