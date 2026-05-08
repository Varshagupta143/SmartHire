import { useState } from "react";
import API from "../services/api";

/**
 * Modal: uploads resume then submits application for a specific job.
 * Props:
 *   userId  - current user's ID
 *   jobId   - job being applied to
 *   jobTitle - display name
 *   onClose - called when modal should close
 *   onSuccess - called after successful apply
 */
export default function ResumeUploadModal({ userId, jobId, jobTitle, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("idle"); // idle | uploading | applying | done | error
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!file) { setMessage("Please select your resume file."); return; }

    setMessage("");
    setStep("uploading");
    try {
      // Step 1: Upload resume
      const formData = new FormData();
      formData.append("file", file);
      await API.post(`/resumes/upload/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Step 2: Submit application
      setStep("applying");
      await API.post("/applications/apply", { userId, jobId });

      setStep("done");
      onSuccess && onSuccess();
    } catch (err) {
      setStep("error");
      setMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Apply — {jobTitle}</h5>
            <button className="btn-close" onClick={onClose} disabled={step === "uploading" || step === "applying"} />
          </div>

          <div className="modal-body">
            {step === "done" ? (
              <div className="text-center py-3">
                <div className="text-success fs-1">✓</div>
                <h5 className="mt-2">Application Submitted!</h5>
                <p className="text-muted">Your resume has been uploaded and your application is under review.</p>
              </div>
            ) : (
              <>
                <p className="text-muted mb-3">
                  Upload your latest resume to apply for this position. Supported formats: PDF, DOC, DOCX, TXT.
                </p>

                <label className="form-label fw-semibold">Select Resume</label>
                <input
                  className="form-control mb-3"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={step !== "idle"}
                />

                {file && (
                  <div className="alert alert-light border py-2 mb-3">
                    📎 {file.name} <span className="text-muted">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}

                {message && <div className={`alert ${step === "error" ? "alert-danger" : "alert-info"} py-2`}>{message}</div>}

                {(step === "uploading" || step === "applying") && (
                  <div className="d-flex align-items-center gap-2 text-primary">
                    <div className="spinner-border spinner-border-sm" role="status" />
                    <span>{step === "uploading" ? "Uploading resume…" : "Submitting application…"}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            {step === "done" ? (
              <button className="btn btn-success" onClick={onClose}>Close</button>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={onClose} disabled={step !== "idle"}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={!file || step !== "idle"}
                >
                  Upload & Apply
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
