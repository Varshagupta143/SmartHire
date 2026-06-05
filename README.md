# SmartHire

SmartHire is a full-stack job portal built with Spring Boot, React, MongoDB Atlas, JWT authentication, and a FastAPI-based ML service.

The platform allows candidates to browse jobs, upload resumes, check resume-job match score, and apply only if their resume matches the job by 50% or more. HR users can post jobs, review applicants, run ML-based ranking, accept or reject candidates, and send email notifications. Admin users can create HR accounts and monitor the platform.

---

## Features

### Candidate / User Features

- Register and login
- Browse all available jobs
- Search jobs by title, company, or keywords
- View complete job details
- Upload resume while applying
- Resume-job match score calculation
- Apply only if match score is 50% or more
- View applied jobs
- View application status:
    - PENDING
    - ACCEPTED
    - REJECTED
- Receive email notification when application is accepted or rejected

---

### HR Features

- Login with HR account created by Admin
- Post new jobs
- View only own posted jobs
- View applicants for own jobs only
- View candidate details and resume content
- Run ML-based candidate ranking
- Accept or reject candidates
- Update application status
- Send email notification to candidate on ACCEPTED / REJECTED status
- If email sending fails, application status still updates and HR receives a warning

---

### Admin Features

- Login as system admin
- Create HR accounts
- View all users
- View all jobs
- Monitor all applications
- Manage platform-level data

---

## Tech Stack

### Frontend

- React
- Vite
- Bootstrap
- Axios
- React Router

### Backend

- Java
- Spring Boot
- Spring Security
- JWT Authentication
- MongoDB Atlas
- Java Mail Sender
- DTOs and Mappers
- Jakarta Validation

### ML Service

- Python
- FastAPI
- TF-IDF
- Cosine Similarity
- Resume-job match scoring
- Candidate ranking

### Database

- MongoDB Atlas

---

## Project Structure

```text
SmartHire
├── Backend
│   ├── src/main/java/com/genius/smarthire
│   │   ├── config
│   │   ├── controller
│   │   ├── dto
│   │   ├── exception
│   │   ├── mapper
│   │   ├── model
│   │   ├── repository
│   │   ├── security
│   │   └── service
│   │
│   └── src/main/resources/application.properties
│
├── Frontend
│   ├── src/components
│   ├── src/context
│   ├── src/pages
│   ├── src/routes
│   └── src/services
│
└── ML
    └── main.py