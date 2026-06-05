package com.genius.smarthire.dto;

import com.genius.smarthire.model.Application;

public class ApplicationStatusUpdateResult {

    private Application application;
    private boolean emailSent;
    private String message;

    public ApplicationStatusUpdateResult(Application application, boolean emailSent, String message) {
        this.application = application;
        this.emailSent = emailSent;
        this.message = message;
    }

    public Application getApplication() {
        return application;
    }

    public boolean isEmailSent() {
        return emailSent;
    }

    public String getMessage() {
        return message;
    }
}