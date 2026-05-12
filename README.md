# SmartHire — Full Stack Hiring Platform

## Architecture

```
SmartHire/
├── Frontend/       React + Vite + Bootstrap 5
├── Backend/        Spring Boot + MongoDB
└── ML/             FastAPI + scikit-learn (TF-IDF ranking)
```

---

## Features

| Role      | Features |
|-----------|----------|
| Candidate | Browse jobs, click a job → upload resume → apply in one step |
| HR        | See all jobs with applicant counts → click job → **Run ML Ranking** → view resume → Accept / Reject |
| Admin     | Post jobs, **delete jobs**, view all users |

---

## Setup & Run

### 1. ML Service (Python — port 8000)

```bash
cd ML
pip install -r requirements.txt
python main.py
```

Verify: http://localhost:8000/health → `{"status":"ok"}`

---

### 2. Backend (Spring Boot — port 8081)

**Prerequisites:** Java 17+, Maven

```bash
cd Backend
./mvnw spring-boot:run
```

MongoDB is pre-configured via Atlas (cloud). No local MongoDB needed.

Verify: http://localhost:8081/api/jobs

---

### 3. Frontend (React — port 5173)

```bash
cd Frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## Routes (Frontend)

| Path              | Page                  | Role       |
|-------------------|-----------------------|------------|
| `/login`          | Login                 | Public     |
| `/register`       | Register              | Public     |
| `/user`           | Browse & Apply Jobs   | Candidate  |
| `/user/jobs/:id`  | Job Detail + Apply    | Candidate  |
| `/hr`             | HR Dashboard (jobs)   | HR / Admin |
| `/hr/jobs/:jobId` | Applicants + Rankings | HR / Admin |
| `/admin`          | Post/Delete Jobs      | Admin      |

---

## API Endpoints (Backend)

### Jobs
| Method | Path            | Description       |
|--------|-----------------|-------------------|
| GET    | /api/jobs       | List all jobs     |
| POST   | /api/jobs       | Create job        |
| DELETE | /api/jobs/{id}  | Delete job        |

### Applications
| Method | Path                          | Description              |
|--------|-------------------------------|--------------------------|
| POST   | /api/applications/apply       | Submit application       |
| GET    | /api/applications             | All applications (HR)    |
| GET    | /api/applications/job/{jobId} | Applications for one job |
| GET    | /api/applications/user/{uid}  | User's applications      |
| PUT    | /api/applications/{id}/status | Accept / Reject          |

### Resumes
| Method | Path                       | Description              |
|--------|----------------------------|--------------------------|
| POST   | /api/resumes/upload/{uid}  | Upload + extract resume  |

### Users
| Method | Path               | Description     |
|--------|--------------------|-----------------|
| POST   | /api/users/register | Register user  |
| POST   | /api/users/login    | Login          |
| GET    | /api/users          | All users      |

### ML Service
| Method | Path    | Description                        |
|--------|---------|------------------------------------|
| POST   | /rank   | Rank resume against job (0–100)    |
| GET    | /health | Health check                       |

---

## How ML Ranking Works

1. HR opens a job's applicants page and clicks **"Run ML Ranking"**
2. Frontend sends each candidate's `resumeContent` + the `job.description` to the Python `/rank` endpoint
3. Python uses **TF-IDF cosine similarity** to score each resume against the job (0–100)
4. Candidates are sorted by score, displayed with a progress bar
5. HR can view full resume text, then Accept or Reject

---

## Notes

- Resume text is extracted server-side using Apache Tika (supports PDF, DOCX, TXT)
- No JWT auth — uses `localStorage` user object (add Spring Security for production)
- ML service must be running for rankings to work; the app still functions without it (scores show 0)
