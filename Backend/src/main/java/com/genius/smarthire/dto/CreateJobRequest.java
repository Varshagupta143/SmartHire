package com.genius.smarthire.dto;
import jakarta.validation.constraints.NotBlank;
public class CreateJobRequest {
    @NotBlank(message = "Job title is required")
    private String title;
    @NotBlank(message = "Company is required")
    private String company;
    @NotBlank(message = "Location is required")
    private String location;
    @NotBlank(message = "Job description is required")
    private String description;

    public CreateJobRequest() {
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
}