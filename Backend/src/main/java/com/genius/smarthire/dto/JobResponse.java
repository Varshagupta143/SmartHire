package com.genius.smarthire.dto;

public class JobResponse {

    private String id;
    private String title;
    private String company;
    private String location;
    private String description;
    private String postedByHrId;
    private String postedByHrEmail;

    /*
     * Job status is sent to frontend so that:
     *
     * Candidate side:
     * - can show/apply only OPEN jobs
     *
     * HR side:
     * - can see whether own job is OPEN or CLOSED
     * - can close/reopen job
     *
     * Admin side:
     * - can monitor all jobs with their status
     */
    private String status;

    public JobResponse() {
    }

    public JobResponse(String id, String title, String company, String location,
                       String description, String postedByHrId,
                       String postedByHrEmail, String status) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.description = description;
        this.postedByHrId = postedByHrId;
        this.postedByHrEmail = postedByHrEmail;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getCompany() {
        return company;
    }

    public String getLocation() {
        return location;
    }

    public String getDescription() {
        return description;
    }

    public String getPostedByHrId() {
        return postedByHrId;
    }

    public String getPostedByHrEmail() {
        return postedByHrEmail;
    }

    public String getStatus() {
        return status;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPostedByHrId(String postedByHrId) {
        this.postedByHrId = postedByHrId;
    }

    public void setPostedByHrEmail(String postedByHrEmail) {
        this.postedByHrEmail = postedByHrEmail;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}