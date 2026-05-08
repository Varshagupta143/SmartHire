package com.genius.smarthire.controller;

import com.genius.smarthire.model.Application;
import com.genius.smarthire.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody Application application) {
        try {
            return ResponseEntity.ok(applicationService.applyForJob(application));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/job/{jobId}")
    public List<Application> getByJob(@PathVariable String jobId) {
        return applicationService.getApplicationsByJob(jobId);
    }

    @GetMapping("/user/{userId}")
    public List<Application> getByUser(@PathVariable String userId) {
        return applicationService.getApplicationsByUser(userId);
    }

    @PutMapping("/{id}/status")
    public Application updateStatus(@PathVariable String id, @RequestBody Map<String, String> statusUpdate) {
        String status = statusUpdate.get("status");
        return applicationService.updateApplicationStatus(id, status);
    }
    @GetMapping
    public List<Application> getAll() {
        return applicationService.getAllApplications();
    }
}