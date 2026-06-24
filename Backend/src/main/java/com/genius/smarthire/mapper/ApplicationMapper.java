package com.genius.smarthire.mapper;

import com.genius.smarthire.dto.ApplicationResponse;
import com.genius.smarthire.model.Application;
import com.genius.smarthire.model.User;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {

    public ApplicationResponse toResponse(Application application) {
        if (application == null) {
            return null;
        }

        return new ApplicationResponse(
                application.getId(),
                application.getJobId(),
                application.getUserId(),
                application.getMatchScore(),
                application.getStatus(),
                null,
                null,
                null
        );
    }

    public ApplicationResponse toResponse(
            Application application,
            User user
    ) {
        if (application == null) {
            return null;
        }

        return new ApplicationResponse(
                application.getId(),
                application.getJobId(),
                application.getUserId(),
                application.getMatchScore(),
                application.getStatus(),
                user != null ? user.getName() : null,
                user != null ? user.getEmail() : null,
                user != null ? user.getResumeContent() : null
        );
    }
}