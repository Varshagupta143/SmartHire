package com.genius.smarthire.controller;

import com.genius.smarthire.dto.CreateJobRequest;
import com.genius.smarthire.dto.JobResponse;
import com.genius.smarthire.mapper.JobMapper;
import com.genius.smarthire.model.Job;
import com.genius.smarthire.service.JobService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    /*
     * HR creates a new job.
     *
     * We do not take HR email from frontend.
     * Logged-in HR email comes from JWT token using authentication.getName().
     */
    @PostMapping
    public ResponseEntity<?> createJob(
            @Valid @RequestBody CreateJobRequest request,
            Authentication authentication
    ) {
        Job savedJob = jobService.createJob(
                request,
                authentication.getName()
        );

        return ResponseEntity.ok(jobMapper.toResponse(savedJob));
    }

    /*
     * Candidate/Public job listing.
     *
     * This returns only OPEN jobs.
     * CLOSED jobs are hidden from candidate dashboard.
     */
    @GetMapping
    public List<JobResponse> getAllJobs() {
        return jobService.getAllJobs()
                .stream()
                .map(jobMapper::toResponse)
                .toList();
    }

    /*
     * Admin job listing.
     *
     * Admin should see complete history:
     * OPEN + CLOSED jobs.
     */
    @GetMapping("/all")
    public List<JobResponse> getAllJobsForAdmin() {
        return jobService.getAllJobsForAdmin()
                .stream()
                .map(jobMapper::toResponse)
                .toList();
    }

    /*
     * HR job listing.
     *
     * HR sees only their own jobs.
     * HR can see both OPEN and CLOSED jobs.
     */
    @GetMapping("/my-jobs")
    public List<JobResponse> getMyJobs(Authentication authentication) {
        return jobService.getJobsPostedByHr(authentication.getName())
                .stream()
                .map(jobMapper::toResponse)
                .toList();
    }

    /*
     * Get job by id.
     *
     * Used by View Details page.
     */
    @GetMapping("/{id}")
    public JobResponse getJobById(@PathVariable String id) {
        Job job = jobService.getJobById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        return jobMapper.toResponse(job);
    }

    /*
     * HR edits own job.
     *
     * Backend checks ownership in JobService.
     * HR1 cannot edit HR2's job.
     */
    @PutMapping("/{id}")
    public JobResponse updateJob(
            @PathVariable String id,
            @Valid @RequestBody CreateJobRequest request,
            Authentication authentication
    ) {
        Job updatedJob = jobService.updateJobByHr(
                id,
                request,
                authentication.getName()
        );

        return jobMapper.toResponse(updatedJob);
    }

    /*
     * HR closes own job.
     *
     * This does NOT delete the job.
     *
     * CLOSED job:
     * - hidden from candidate dashboard
     * - candidate cannot apply
     * - visible to HR/Admin for history
     */
    @PatchMapping("/{id}/close")
    public JobResponse closeJob(
            @PathVariable String id,
            Authentication authentication
    ) {
        Job closedJob = jobService.closeJobByHr(
                id,
                authentication.getName()
        );

        return jobMapper.toResponse(closedJob);
    }

    /*
     * HR reopens own closed job.
     *
     * CLOSED → OPEN
     *
     * After reopening, candidates can see/apply again.
     */
    @PatchMapping("/{id}/reopen")
    public JobResponse reopenJob(
            @PathVariable String id,
            Authentication authentication
    ) {
        Job reopenedJob = jobService.reopenJobByHr(
                id,
                authentication.getName()
        );

        return jobMapper.toResponse(reopenedJob);
    }

    /*
     * Admin permanent delete.
     *
     * HR should not use delete.
     * HR should use close/reopen.
     *
     * Keep delete only for Admin if SecurityConfig allows ADMIN only.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable String id) {
        jobService.deleteJob(id);

        return ResponseEntity.ok(
                Map.of("message", "Job deleted successfully")
        );
    }

    /*
     * Public search.
     *
     * JobService already filters only OPEN jobs.
     */
    @GetMapping("/search")
    public List<JobResponse> search(@RequestParam("keyword") String keyword) {
        return jobService.searchJobs(keyword)
                .stream()
                .map(jobMapper::toResponse)
                .toList();
    }

    /*
     * Public/User recommendations.
     *
     * This is old fallback recommendation logic.
     * Your apply score already uses FastAPI ML service.
     */
    @GetMapping("/recommendations/{userId}")
    public List<Map<String, Object>> getRecommendations(@PathVariable String userId) {
        return jobService.getBestMatches(userId);
    }

    /*
     * Public location filter.
     *
     * JobService already filters only OPEN jobs.
     */
    @GetMapping("/location/{loc}")
    public List<JobResponse> getByLocation(@PathVariable String loc) {
        return jobService.getJobsByLocation(loc)
                .stream()
                .map(jobMapper::toResponse)
                .toList();
    }
}