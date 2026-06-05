package com.genius.smarthire.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateApplicationStatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(
            regexp = "PENDING|ACCEPTED|REJECTED",
            message = "Status must be PENDING, ACCEPTED, or REJECTED"
    )
    private String status;

    public UpdateApplicationStatusRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status != null ? status.toUpperCase() : null;
    }
}