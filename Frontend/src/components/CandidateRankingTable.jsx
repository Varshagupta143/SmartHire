import { useState } from "react";

/**
 * Props:
 *   candidates: Array<{ userId, name, email, score, status, applicationId, resumeContent, resumePath }>
 *   onUpdateStatus(applicationId, status): Promise
 */
export default function CandidateRankingTable({ candidates, onUpdateStatus }) {
  const [viewResume, setViewResume] = useState(null); // candidate object
  const [updating, setUpdating] = useState(null);

  const handleStatus = async (applicationId, status) => {
    setUpdating(applicationId);
    try {
      await onUpdateStatus(applicationId, status);
    } finally {
      setUpdating(null);
    }
  };

  const rankBadge = (idx) => {
    if (idx === 0) return <span className="badge rank-1 score-badge">🥇 #1</span>;
    if (idx === 1) return <span className="badge rank-2 score-badge">🥈 #2</span>;
    if (idx === 2) return <span className="badge rank-3 score-badge">🥉 #3</span>;
    return <span className="badge bg-secondary score-badge">#{idx + 1}</span>;
  };

  const scorePill = (score) => {
    const pct = Math.round(score || 0);
    const color = pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger";
    return (
      <div className="d-flex align-items-center gap-2">
        <div className="progress flex-grow-1" style={{ height: 8 }}>
          <div className={`progress-bar bg-${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`badge bg-${color}`}>{pct}/100</span>
      </div>
    );
  };

  const statusBadge = (status) => {
    const map = { ACCEPTED: "success", REJECTED: "danger", PENDING: "warning text-dark" };
    return <span className={`badge bg-${map[status] || "secondary"}`}>{status || "PENDING"}</span>;
  };

  if (!candidates || candidates.length === 0) {
    return <p className="text-muted mt-3">No applicants yet.</p>;
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Rank</th>
              <th>Candidate</th>
              <th style={{ minWidth: 180 }}>ML Score (out of 100)</th>
              <th>Status</th>
              <th>Resume</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, idx) => (
              <tr key={c.userId || idx} className="candidate-row">
                <td>{rankBadge(idx)}</td>
                <td>
                  <div className="fw-semibold">{c.name || "—"}</div>
                  <small className="text-muted">{c.email || c.userId}</small>
                </td>
                <td style={{ minWidth: 180 }}>{scorePill(c.score)}</td>
                <td>{statusBadge(c.status)}</td>
                <td>
                  {c.resumeContent ? (
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setViewResume(c)}
                    >
                      📄 View
                    </button>
                  ) : (
                    <span className="text-muted small">No resume</span>
                  )}
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-success"
                      disabled={c.status === "ACCEPTED" || updating === c.applicationId}
                      onClick={() => handleStatus(c.applicationId, "ACCEPTED")}
                    >
                      ✓ Accept
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      disabled={c.status === "REJECTED" || updating === c.applicationId}
                      onClick={() => handleStatus(c.applicationId, "REJECTED")}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resume Viewer Modal */}
      {viewResume && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.55)" }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">📄 Resume — {viewResume.name || viewResume.userId}</h5>
                <button className="btn-close" onClick={() => setViewResume(null)} />
              </div>
              <div className="modal-body">
                <div className="d-flex gap-3 mb-3">
                  {viewResume.name && <span><strong>Name:</strong> {viewResume.name}</span>}
                  {viewResume.email && <span><strong>Email:</strong> {viewResume.email}</span>}
                  <span><strong>Score:</strong> <span className="badge bg-primary">{Math.round(viewResume.score || 0)}/100</span></span>
                </div>
                <hr />
                <pre className="p-3 bg-light rounded border" style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", maxHeight: 480, overflowY: "auto" }}>
                  {viewResume.resumeContent || "No resume content available."}
                </pre>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success btn-sm"
                  disabled={viewResume.status === "ACCEPTED"}
                  onClick={() => { handleStatus(viewResume.applicationId, "ACCEPTED"); setViewResume(null); }}
                >✓ Accept</button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={viewResume.status === "REJECTED"}
                  onClick={() => { handleStatus(viewResume.applicationId, "REJECTED"); setViewResume(null); }}
                >✗ Reject</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setViewResume(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
