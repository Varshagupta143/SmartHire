import { useState } from "react";
import API from "../services/api";

export default function ResumeUploadModal({ userId, jobId, jobTitle, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("idle");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(null);
  const [eligible, setEligible] = useState(false);

  const handleCheckScore = async () => {
    if (!file) {
      setMessage("Please select your resume file.");
      return;
    }

    setMessage("");
    setStep("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      await API.post("/resumes/upload/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStep("checking");

      const scoreRes = await API.get(`/applications/score/${jobId}`);

      setScore(scoreRes.data.score);
      setEligible(scoreRes.data.eligible);

      if (scoreRes.data.eligible) {
        setMessage(`Your resume match score is ${scoreRes.data.score}%. You can apply now.`);
        setStep("ready");
      } else {
        setMessage(
          `Your resume match score is ${scoreRes.data.score}%. Minimum 50% is required to apply.`
        );
        setStep("blocked");
      }

    } catch (err) {
      setStep("error");
      setMessage(err.message || "Something went wrong.");
    }
  };

  const handleApply = async () => {
    setStep("applying");
    setMessage("");

    try {
      await API.post("/applications/apply", { jobId });

      setStep("done");

      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      setStep("error");
      setMessage(err.message || "Something went wrong.");
    }
  };

  const busy = step === "uploading" || step === "checking" || step === "applying";

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">Apply — {jobTitle}</h5>
            <button className="btn-close" onClick={onClose} disabled={busy} />
          </div>

          <div className="modal-body">
            {step === "done" ? (
              <div className="text-center py-3">
                <div className="text-success fs-1">✓</div>
                <h5 className="mt-2">Application Submitted!</h5>
                <p className="text-muted">
                  Your resume matched at least 50%, so your application was submitted.
                </p>
              </div>
            ) : (
              <>
                <p className="text-muted mb-3">
                  Upload your resume. You can apply only if your resume match score is 50% or more.
                </p>

                <label className="form-label fw-semibold">Select Resume</label>

                <input
                  className="form-control mb-3"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    setScore(null);
                    setEligible(false);
                    setStep("idle");
                    setMessage("");
                  }}
                  disabled={busy}
                />

                {file && (
                  <div className="alert alert-light border py-2 mb-3">
                    📎 {file.name}
                    <span className="text-muted">
                      {" "}({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}

                {score !== null && (
                  <div className={`alert ${eligible ? "alert-success" : "alert-warning"} py-2`}>
                    Resume Match Score: <strong>{score}%</strong>
                  </div>
                )}

                {message && (
                  <div className={`alert ${step === "error" || step === "blocked" ? "alert-danger" : "alert-info"} py-2`}>
                    {message}
                  </div>
                )}

                {busy && (
                  <div className="d-flex align-items-center gap-2 text-primary">
                    <div className="spinner-border spinner-border-sm" role="status" />
                    <span>
                      {step === "uploading" && "Uploading resume..."}
                      {step === "checking" && "Checking resume match..."}
                      {step === "applying" && "Submitting application..."}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            {step === "done" ? (
              <button className="btn btn-success" onClick={onClose}>
                Close
              </button>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={onClose} disabled={busy}>
                  Cancel
                </button>

                {step !== "ready" ? (
                  <button
                    className="btn btn-primary"
                    onClick={handleCheckScore}
                    disabled={!file || busy}
                  >
                    Upload & Check Score
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={handleApply}
                    disabled={!eligible || busy}
                  >
                    Apply Now
                  </button>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}