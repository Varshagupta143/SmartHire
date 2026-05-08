package com.genius.smarthire.service;

import com.genius.smarthire.model.Application;
import com.genius.smarthire.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    public Application applyForJob(Application application) {
        return applicationRepository.save(application);
    }

    public List<Application> getApplicationsByJob(String jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public List<Application> getApplicationsByUser(String userId) {
        return applicationRepository.findByUserId(userId);
    }
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }
    public Application updateApplicationStatus(String id, String newStatus) {
        return applicationRepository.findById(id).map(app -> {
            app.setStatus(newStatus.toUpperCase());
            return applicationRepository.save(app);
        }).orElseThrow(() -> new RuntimeException("Application not found"));
    }
}