package com.genius.smarthire.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "jobs")
public class Job {

    @Id
    private String id;

    // Job title shown to candidates and HR
    private String title;

    // Full job description used for resume matching also
    private String description;

    // Company name
    private String company;

    // Job location
    private String location;

    /*
     * These two fields store who posted the job.
     *
     * We do not take this from frontend.
     * Backend sets these values from logged-in HR's JWT token.
     *
     * Why?
     * Because HR1 should not be able to create/edit job as HR2.
     */
    private String postedByHrId;
    private String postedByHrEmail;

    /*
     * Job status controls visibility and applying.
     *
     * OPEN:
     * - Candidate can see this job
     * - Candidate can apply
     *
     * CLOSED:
     * - Candidate should not see this job on dashboard
     * - Candidate cannot apply
     * - HR/Admin can still see it for history
     *
     * We use status instead of deleting jobs because old applications
     * should remain connected to this job.
     */
    private String status = "OPEN";

    // Default constructor is required by MongoDB/Spring
    public Job() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPostedByHrId() {
        return postedByHrId;
    }

    public void setPostedByHrId(String postedByHrId) {
        this.postedByHrId = postedByHrId;
    }

    public String getPostedByHrEmail() {
        return postedByHrEmail;
    }

    public void setPostedByHrEmail(String postedByHrEmail) {
        this.postedByHrEmail = postedByHrEmail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}