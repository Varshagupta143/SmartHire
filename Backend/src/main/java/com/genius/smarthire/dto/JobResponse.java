package com.genius.smarthire.dto;

public class JobResponse {

    private String id;
    private String title;
    private String company;
    private String location;
    private String description;
    private String postedByHrId;
    private String postedByHrEmail;

    public JobResponse() {
    }

    public JobResponse(String id, String title, String company, String location,
                       String description, String postedByHrId, String postedByHrEmail) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.description = description;
        this.postedByHrId = postedByHrId;
        this.postedByHrEmail = postedByHrEmail;
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
}