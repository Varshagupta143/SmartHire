import axios from "axios";

const ML_API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

/**
 * Rank ALL candidates for a job in ONE request to the ML service.
 * Uses the /rank-candidates batch endpoint (faster and more accurate).
 *
 * @param {string} jobTitle       - Job title
 * @param {string} jobDescription - Job description text
 * @param {Array}  candidates     - [{ userId, name, email, resumeContent }]
 * @returns {Promise<Array>}      - sorted [{ userId, name, email, score }]
 */
export async function rankCandidates(jobTitle, jobDescription, candidates) {
  if (!candidates || candidates.length === 0) return [];

  try {
    const res = await ML_API.post("/rank-candidates", {
      job_title:       jobTitle       || "",
      job_description: jobDescription || "",
      candidates: candidates.map((c) => ({
        userId:        c.userId        || "",
        name:          c.name          || "",
        email:         c.email         || "",
        resumeContent: c.resumeContent || "",
      })),
    });

    if (Array.isArray(res.data)) {
      return res.data; // already sorted by score desc
    }
    console.error("[ML] Unexpected response format:", res.data);
    return candidates.map((c) => ({ ...c, score: 0 }));

  } catch (err) {
    console.error("[ML] /rank-candidates failed:", err?.response?.data || err.message);
    // Fallback: try /rank one at a time
    console.warn("[ML] Falling back to /rank (one by one)…");
    return fallbackRankOneByOne(jobTitle, jobDescription, candidates);
  }
}

/**
 * Fallback: call /rank for each candidate individually.
 * Used if the ML service is an older version without /rank-candidates.
 */
async function fallbackRankOneByOne(jobTitle, jobDescription, candidates) {
  const results = await Promise.all(
    candidates.map(async (c) => {
      try {
        const res = await ML_API.post("/rank", {
          resume_content: c.resumeContent || "",
          jobs: [{
            id:          c.userId,
            title:       jobTitle       || "",
            description: jobDescription || "",
          }],
        });
        const score =
          Array.isArray(res.data) && res.data[0]
            ? res.data[0].score
            : 0;
        return { userId: c.userId, name: c.name, email: c.email, score };
      } catch (e) {
        console.error(`[ML] /rank failed for ${c.userId}:`, e.message);
        return { userId: c.userId, name: c.name, email: c.email, score: 0 };
      }
    })
  );
  return results.sort((a, b) => b.score - a.score);
}

export default ML_API;
