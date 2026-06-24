package com.genius.smarthire.dto;

public class ApplicationResponse {

    private String id;
    private String jobId;
    private String userId;
    private double matchScore;
    private String status;

    private String candidateName;
    private String candidateEmail;
    private String resumeContent;

    public ApplicationResponse() {
    }

    public ApplicationResponse(
            String id,
            String jobId,
            String userId,
            double matchScore,
            String status,
            String candidateName,
            String candidateEmail,
            String resumeContent
    ) {
        this.id = id;
        this.jobId = jobId;
        this.userId = userId;
        this.matchScore = matchScore;
        this.status = status;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        this.resumeContent = resumeContent;
    }

    public String getId() {
        return id;
    }

    public String getJobId() {
        return jobId;
    }

    public String getUserId() {
        return userId;
    }

    public double getMatchScore() {
        return matchScore;
    }

    public String getStatus() {
        return status;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public String getResumeContent() {
        return resumeContent;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setMatchScore(double matchScore) {
        this.matchScore = matchScore;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }

    public void setResumeContent(String resumeContent) {
        this.resumeContent = resumeContent;
    }
}