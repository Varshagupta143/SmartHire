from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ───────────────────────────────────────────────────────────────────

class MatchRequest(BaseModel):
    resume_content: Optional[str] = ""
    jobs: List[Dict]

class CandidateRequest(BaseModel):
    job_description: str
    job_title: Optional[str] = ""
    candidates: List[Dict]

# ─── Constants ────────────────────────────────────────────────────────────────

TECH_KEYWORDS = {
    "python","java","javascript","typescript","react","angular","vue",
    "nodejs","node","spring","springboot","django","flask","fastapi",
    "sql","mysql","postgresql","mongodb","redis","elasticsearch",
    "aws","azure","gcp","docker","kubernetes","devops","git","linux",
    "html","css","rest","api","graphql","microservices",
    "machine learning","deep learning","tensorflow","pytorch","nlp",
    "data science","pandas","numpy","scikit","sklearn",
    "c++","c#","golang","go","rust","php","ruby","scala","kotlin","swift",
    "android","ios","flutter","react native",
    "agile","scrum","jira","communication","leadership","teamwork",
    "bachelor","master","phd","degree","engineering","computer science",
    "software","developer","engineer","analyst","architect","manager",
    "fullstack","full stack","frontend","backend","qa","testing","automation",
    "excel","tableau","power bi","figma","photoshop","ux","ui",
    "accounting","finance","marketing","sales","hr","human resources",
    "project management","product management","business analysis",
}

EXPERIENCE_PATTERNS = [
    r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
    r'(\d+)\+?\s*yrs?\s+(?:of\s+)?experience',
    r'experience\s+of\s+(\d+)\+?\s*years?',
    r'worked?\s+for\s+(\d+)\+?\s*years?',
]

EDUCATION_SCORES = {
    "phd":5,"doctorate":5,"master":4,"mtech":4,"mba":4,"msc":4,
    "bachelor":3,"btech":3,"bsc":3,"be":3,"graduate":2,"diploma":1,
}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def clean(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_years(text: str) -> int:
    best = 0
    tl = text.lower()
    for p in EXPERIENCE_PATTERNS:
        for m in re.findall(p, tl):
            try: best = max(best, int(m))
            except: pass
    return best

def extract_edu(text: str) -> int:
    tl = text.lower()
    return max((v for k, v in EDUCATION_SCORES.items() if k in tl), default=0)

def extract_kw(text: str) -> set:
    tl = text.lower()
    return {kw for kw in TECH_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', tl)}

def tfidf_sim(a: str, b: str) -> float:
    if not a.strip() or not b.strip():
        return 0.0
    try:
        vec = TfidfVectorizer(stop_words='english', ngram_range=(1,2),
                              token_pattern=r'\w{2,}', min_df=1)
        mat = vec.fit_transform([a, b])
        if mat.shape[1] == 0:
            return 0.0
        return float(cosine_similarity(mat[0:1], mat[1:2])[0][0])
    except Exception as e:
        print(f"[tfidf error] {e}")
        return 0.0

def score_candidate(resume: str, job_title: str, job_desc: str) -> float:
    """
    Multi-signal scoring:
      40 pts  TF-IDF cosine similarity
      35 pts  Keyword / skill overlap
      15 pts  Experience match
      10 pts  Education level
    """
    if not resume or not resume.strip():
        return 0.0

    job_full   = f"{job_title} {job_desc}"
    r_clean    = clean(resume)
    j_clean    = clean(job_full)

    # 1. TF-IDF (40 pts) — raw cosine 0–~0.4 mapped to 0–40
    raw_tfidf  = tfidf_sim(r_clean, j_clean)
    s_tfidf    = min(raw_tfidf / 0.35, 1.0) * 40.0

    # 2. Keyword overlap (35 pts)
    r_kw = extract_kw(resume)
    j_kw = extract_kw(job_full)
    if j_kw:
        kw_ratio = len(r_kw & j_kw) / len(j_kw)
    else:
        # fallback: raw word overlap with boost
        r_words = set(r_clean.split())
        j_words = set(j_clean.split())
        kw_ratio = min(len(r_words & j_words) / max(len(j_words), 1) * 4, 1.0)
    s_kw = kw_ratio * 35.0

    # 3. Experience (15 pts)
    r_exp = extract_years(resume)
    j_exp = extract_years(job_full)
    if j_exp == 0:
        exp_ratio = min(r_exp / 3.0, 1.0) if r_exp > 0 else 0.5
    else:
        exp_ratio = 1.0 if r_exp >= j_exp else (r_exp / j_exp if r_exp > 0 else 0.15)
    s_exp = exp_ratio * 15.0

    # 4. Education (10 pts)
    s_edu = min(extract_edu(resume) / 3.0, 1.0) * 10.0

    total = round(min(s_tfidf + s_kw + s_exp + s_edu, 100.0), 2)
    print(f"[ML] tfidf={s_tfidf:.1f} kw={s_kw:.1f} exp={s_exp:.1f} edu={s_edu:.1f} => {total}")
    return total

# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.post("/rank")
async def rank_jobs(data: MatchRequest):
    """Rank jobs for one resume. Called by frontend one candidate at a time."""
    if not data.jobs:
        return []
    results = []
    for job in data.jobs:
        job_id = job.get("id") or job.get("_id") or "unknown"
        title  = job.get("title", "") or ""
        desc   = job.get("description") or job.get("jobDescription") or ""
        score  = score_candidate(data.resume_content or "", title, desc)
        results.append({"jobId": job_id, "score": score})
    return sorted(results, key=lambda x: x["score"], reverse=True)


@app.post("/rank-candidates")
async def rank_candidates_batch(data: CandidateRequest):
    """
    Batch endpoint: rank ALL candidates for one job in a single call.
    Frontend should prefer this over calling /rank N times.
    """
    results = []
    for c in data.candidates:
        resume = c.get("resumeContent") or c.get("resume_content") or ""
        score  = score_candidate(resume, data.job_title or "", data.job_description)
        results.append({
            "userId": c.get("userId") or "",
            "name":   c.get("name", ""),
            "email":  c.get("email", ""),
            "score":  score,
        })
    return sorted(results, key=lambda x: x["score"], reverse=True)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "scoring": {
            "tfidf_cosine": "40pts",
            "keyword_overlap": "35pts",
            "experience_match": "15pts",
            "education_level": "10pts",
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
