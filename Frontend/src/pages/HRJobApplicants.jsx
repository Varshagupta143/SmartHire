import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CandidateRankingTable from "../components/CandidateRankingTable";
import API from "../services/api";
import { rankCandidates } from "../services/mlApi";

export default function HRJobApplicants() {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [job, setJob] = useState(location.state?.job || null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rankingStatus, setRankingStatus] = useState("idle");
  const [rankingError, setRankingError] = useState("");

  const [toast, setToast] = useState({
    msg: "",
    type: "success",
  });

  useEffect(() => {
    loadApplicants();

    if (!job) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const res = await API.get("/jobs");
      const found = res.data.find((j) => j.id === jobId);

      if (found) {
        setJob(found);
      }
    } catch (err) {
      console.error("Failed to fetch job:", err);
    }
  };

  const loadApplicants = async () => {
    setLoading(true);

    try {
      /*
        Backend endpoint:
        GET /api/applications/job/{jobId}

         This returns application + candidate details:
         candidateName, candidateEmail, resumeContent
      */
      const appsRes = await API.get(`/applications/job/${jobId}`);
      const apps = appsRes.data;

      if (apps.length === 0) {
        setCandidates([]);
        return;
      }

      const enriched = apps.map((app) => {
        return {
          applicationId: app.id,
          userId: app.userId,

          name: app.candidateName || "Unknown",
          email: app.candidateEmail || "",
          resumeContent: app.resumeContent || "",

          status: app.status || "PENDING",
          appliedAt: app.appliedAt,

          score: app.matchScore || 0,
        };
      });

      setCandidates(enriched);
    } catch (err) {
      console.error("Failed to load applicants:", err);
      showToast("Failed to load applicants: " + err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  const runMLRanking = async () => {
    if (!job?.description) {
      setRankingError("Job description is missing — cannot rank candidates.");
      return;
    }

    if (candidates.length === 0) {
      setRankingError("No candidates have applied yet.");
      return;
    }

    const withResume = candidates.filter(
      (c) => c.resumeContent && c.resumeContent.trim().length > 10
    );

    if (withResume.length === 0) {
      setRankingError(
        "No candidates have uploaded a resume yet. Ask them to upload before ranking."
      );
      return;
    }

    setRankingStatus("ranking");
    setRankingError("");

    try {
      const ranked = await rankCandidates(
        job.title || "",
        job.description,
        withResume
      );

      const scoreMap = {};

      ranked.forEach((r) => {
        scoreMap[r.userId] = r.score;
      });

      setCandidates((prev) =>
        [...prev]
          .map((c) => ({
            ...c,
            score: scoreMap[c.userId] ?? 0,
          }))
          .sort((a, b) => b.score - a.score)
      );

      setRankingStatus("done");
    } catch (err) {
      setRankingStatus("error");
      setRankingError(
        "ML service error: " +
          err.message +
          ". Make sure the Python ML server is running on port 8000."
      );
    }
  };


const handleUpdateStatus = async (applicationId, status) => {
  try {
    const res = await API.put(`/applications/${applicationId}/status`, {
      status,
    });

    setCandidates((prev) =>
      prev.map((c) =>
        c.applicationId === applicationId ? { ...c, status } : c
      )
    );

    if (res.data.emailSent) {
      showToast(`Candidate ${status.toLowerCase()} successfully. Email sent.`, "success");
    } else {
      showToast(res.data.message || "Status updated, but email failed.", "warning");
    }
  } catch (err) {
    showToast("Failed to update status: " + err.message, "danger");
    throw err;
  }
};

  const showToast = (msg, type = "success") => {
    setToast({
      msg,
      type,
    });

    setTimeout(() => {
      setToast({
        msg: "",
        type: "success",
      });
    }, 4000);
  };

  const accepted = candidates.filter((c) => c.status === "ACCEPTED").length;
  const rejected = candidates.filter((c) => c.status === "REJECTED").length;
  const pending = candidates.filter((c) => c.status === "PENDING").length;

  return (
    <>
      <Navbar />

      <div className="container mt-4 pb-5">
        <button
          className="btn btn-link text-decoration-none ps-0 mb-3"
          onClick={() => navigate("/hr")}
        >
          ← Back to HR Dashboard
        </button>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <h3 className="mb-1">{job?.title || "Loading…"}</h3>

                <p className="text-muted mb-0">
                  🏢 {job?.company}
                  {job?.location && <> · 📍 {job.location}</>}
                </p>
              </div>

              <div className="d-flex gap-3 flex-wrap">
                {[
                  {
                    label: "Total",
                    value: candidates.length,
                    color: "primary",
                  },
                  {
                    label: "Pending",
                    value: pending,
                    color: "warning",
                  },
                  {
                    label: "Accepted",
                    value: accepted,
                    color: "success",
                  },
                  {
                    label: "Rejected",
                    value: rejected,
                    color: "danger",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="card border-0 shadow-sm text-center px-3 py-2"
                  >
                    <div className={`fs-5 fw-bold text-${color}`}>
                      {value}
                    </div>

                    <div
                      className="text-muted"
                      style={{
                        fontSize: "0.75rem",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {toast.msg && (
          <div
            className={`alert alert-${toast.type} py-2 alert-dismissible`}
            role="alert"
          >
            {toast.msg}
          </div>
        )}

        <div className="card border-0 shadow-sm mb-4 bg-light">
          <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h6 className="mb-1 fw-semibold">
                🤖 ML-Powered Candidate Ranking
              </h6>

              <p className="text-muted mb-0 small">
                Click "Run Ranking" to score each candidate's resume against the
                job description using TF-IDF cosine similarity. Scores are out
                of 100.
              </p>
            </div>

            <div className="d-flex flex-column align-items-end gap-1">
              <button
                className="btn btn-primary"
                onClick={runMLRanking}
                disabled={
                  rankingStatus === "ranking" || candidates.length === 0
                }
              >
                {rankingStatus === "ranking" ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Ranking…
                  </>
                ) : rankingStatus === "done" ? (
                  "🔄 Re-rank"
                ) : (
                  "▶ Run ML Ranking"
                )}
              </button>

              {rankingStatus === "done" && (
                <span className="badge bg-success">✓ Ranked by ML score</span>
              )}
            </div>
          </div>

          {rankingError && (
            <div className="card-footer bg-danger bg-opacity-10 text-danger border-0 small py-2">
              ⚠️ {rankingError}
            </div>
          )}
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0">
              Applicants
              {rankingStatus === "done" && (
                <span className="badge bg-primary ms-2">Ranked by ML</span>
              )}
            </h5>
          </div>

          <div className="card-body p-0 p-md-3">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="mt-2 text-muted">Loading applicants…</p>
              </div>
            ) : (
              <CandidateRankingTable
                candidates={candidates}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}