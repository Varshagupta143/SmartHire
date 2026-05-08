package com.genius.smarthire.controller;

import com.genius.smarthire.model.Job;
import com.genius.smarthire.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping
    public Job createJob(@RequestBody Job job) {
        return jobService.createJob(job);
    }

    @GetMapping
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable String id) {
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Admin: delete a job by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable String id) {
        try {
            jobService.deleteJob(id);
            return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public List<Job> search(@RequestParam("keyword") String keyword) {
        return jobService.searchJobs(keyword);
    }

    @GetMapping("/recommendations/{userId}")
    public List<Map<String, Object>> getRecommendations(@PathVariable String userId) {
        return jobService.getBestMatches(userId);
    }

    @GetMapping("/location/{loc}")
    public List<Job> getByLocation(@PathVariable String loc) {
        return jobService.getJobsByLocation(loc);
    }
}