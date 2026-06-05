package com.genius.smarthire.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "jobs")
public class Job {
    @Id
    private String id;
    private String title;
    private String description;
    private String company;
    private String location;
    private String postedByHrId;
    private String postedByHrEmail;
    // IMPORTANT: You need a default constructor
    public Job() {}

    // IMPORTANT: You MUST have Getters and Setters for every field
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
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
}