package com.genius.smarthire.mapper;

import com.genius.smarthire.dto.JobResponse;
import com.genius.smarthire.model.Job;
import org.springframework.stereotype.Component;

@Component
public class JobMapper {

    public JobResponse toResponse(Job job) {
        if (job == null) {
            return null;
        }

        return new JobResponse(
                job.getId(),
                job.getTitle(),
                job.getCompany(),
                job.getLocation(),
                job.getDescription(),
                job.getPostedByHrId(),
                job.getPostedByHrEmail()
        );
    }
}