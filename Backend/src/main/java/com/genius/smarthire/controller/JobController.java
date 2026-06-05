package com.genius.smarthire.controller;

import com.genius.smarthire.dto.JobResponse;
import com.genius.smarthire.mapper.JobMapper;
import com.genius.smarthire.model.Job;
import com.genius.smarthire.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.genius.smarthire.dto.CreateJobRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    @Autowired
    private JobMapper jobMapper;

    // HR: create job
    // Logged-in HR email comes from JWT token
    @PostMapping

    public ResponseEntity<?> createJob(
            @RequestBody CreateJobRequest request,
            Authentication authentication
    ) {
        try {
            Job savedJob = jobService.createJob(
                    request,
                    authentication.getName()
            );

            return ResponseEntity.ok(jobMapper.toResponse(savedJob));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Public: candidates can see all jobs
    @GetMapping
    public List<JobResponse> getAllJobs() {
        return jobService.getAllJobs()
                .stream()
                .map(jobMapper::toResponse)
                .toList();
    }

    // HR: see only jobs posted by logged-in HR
    @GetMapping("/my-jobs")
    public ResponseEntity<?> getMyJobs(Authentication authentication) {
        return ResponseEntity.ok(
                jobService.getJobsPostedByHr(authentication.getName())
                        .stream()
                        .map(jobMapper::toResponse)
                        .toList()
        );
    }

    // Public: get job by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable String id) {
        return jobService.getJobById(id)
                .map(job -> ResponseEntity.ok(jobMapper.toResponse(job)))
                .orElse(ResponseEntity.notFound().build());
    }

    // HR: delete a job by id
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable String id) {
        try {
            jobService.deleteJob(id);

            return ResponseEntity.ok(
                    Map.of("message", "Job deleted successfully")
            );

        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Public: search jobs
    @GetMapping("/search")
    public List<JobResponse> search(@RequestParam("keyword") String keyword) {
        return jobService.searchJobs(keyword)
                .stream()
                .map(jobMapper::toResponse)
                .toList();
    }

    // Public/user: recommendations
    @GetMapping("/recommendations/{userId}")
    public List<Map<String, Object>> getRecommendations(@PathVariable String userId) {
        return jobService.getBestMatches(userId);
    }

    // Public: jobs by location
    @GetMapping("/location/{loc}")
    public List<JobResponse> getByLocation(@PathVariable String loc) {
        return jobService.getJobsByLocation(loc)
                .stream()
                .map(jobMapper::toResponse)
                .toList();
    }
}