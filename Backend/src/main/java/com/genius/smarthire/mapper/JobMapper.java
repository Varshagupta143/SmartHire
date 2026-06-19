package com.genius.smarthire.mapper;

import com.genius.smarthire.dto.JobResponse;
import com.genius.smarthire.model.Job;
import org.springframework.stereotype.Component;

@Component
public class JobMapper {

    /*
     * This method converts Job model/entity into JobResponse DTO.
     *
     * Why mapper?
     * We do not send database model directly to frontend.
     * We send a clean response object.
     *
     * Job model     → stored in MongoDB
     * JobResponse  → sent to frontend
     */
    public JobResponse toResponse(Job job) {

        if (job == null) {
            return null;
        }

        /*
         * Old jobs in MongoDB may not have status field,
         * because we added status later.
         *
         * So if job.getStatus() is null,
         * we safely return "OPEN" by default.
         */
        String status = job.getStatus() != null ? job.getStatus() : "OPEN";

        return new JobResponse(
                job.getId(),
                job.getTitle(),
                job.getCompany(),
                job.getLocation(),
                job.getDescription(),
                job.getPostedByHrId(),
                job.getPostedByHrEmail(),
                status
        );
    }
}