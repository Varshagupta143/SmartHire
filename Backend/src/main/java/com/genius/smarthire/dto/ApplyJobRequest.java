package com.genius.smarthire.dto;

import jakarta.validation.constraints.NotBlank;

public class ApplyJobRequest {

    @NotBlank(message = "Job id is required")
    private String jobId;

    public ApplyJobRequest() {
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }
}