package com.genius.smarthire.service;

import com.genius.smarthire.dto.CreateJobRequest;
import com.genius.smarthire.model.Job;
import com.genius.smarthire.model.User;
import com.genius.smarthire.repository.JobRepository;
import com.genius.smarthire.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    /*
     * HR creates a new job.
     *
     * Frontend sends only:
     * title, company, location, description
     *
     * Backend sets:
     * postedByHrEmail
     * postedByHrId
     * status = OPEN
     *
     * Why?
     * Frontend should not decide who posted the job.
     * Backend takes HR email from JWT authentication.
     */
    public Job createJob(CreateJobRequest request, String hrEmail) {

        User hr = userRepository.findByEmail(hrEmail)
                .orElseThrow(() -> new RuntimeException("HR user not found"));

        Job job = new Job();

        job.setTitle(request.getTitle());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setDescription(request.getDescription());

        job.setPostedByHrEmail(hr.getEmail());
        job.setPostedByHrId(hr.getId());

        /*
         * New job should always start as OPEN.
         *
         * OPEN means:
         * - Candidate can see it
         * - Candidate can apply
         */
        job.setStatus("OPEN");

        return jobRepository.save(job);
    }

    /*
     * Candidate/Public job listing.
     *
     * Candidate should see only OPEN jobs.
     *
     * Important:
     * Old jobs in MongoDB may not have status field because we added status later.
     * So we treat null status as OPEN.
     */
    public List<Job> getAllJobs() {
        return jobRepository.findAll()
                .stream()
                .filter(this::isOpenJob)
                .collect(Collectors.toList());
    }

    /*
     * Admin job listing.
     *
     * Admin should see all jobs:
     * - OPEN
     * - CLOSED
     *
     * Why?
     * Admin needs complete history and monitoring.
     */
    public List<Job> getAllJobsForAdmin() {
        return jobRepository.findAll();
    }

    /*
     * HR job listing.
     *
     * HR should see all jobs posted by them:
     * - OPEN jobs
     * - CLOSED jobs
     *
     * Why?
     * HR should be able to reopen closed jobs later.
     */
    public List<Job> getJobsPostedByHr(String hrEmail) {
        return jobRepository.findByPostedByHrEmail(hrEmail);
    }

    /*
     * Get a single job by id.
     */
    public Optional<Job> getJobById(String id) {
        return jobRepository.findById(id);
    }

    /*
     * HR edits only their own job.
     *
     * Security rule:
     * HR1 can edit HR1 job.
     * HR1 cannot edit HR2 job.
     *
     * We check ownership using postedByHrEmail.
     */
    public Job updateJobByHr(String jobId, CreateJobRequest request, String hrEmail) {

        Job existingJob = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        checkJobOwnership(existingJob, hrEmail, "update");

        /*
         * Update only editable fields.
         *
         * Do not update:
         * id
         * postedByHrId
         * postedByHrEmail
         * status
         *
         * These fields should stay controlled by backend.
         */
        existingJob.setTitle(request.getTitle());
        existingJob.setCompany(request.getCompany());
        existingJob.setLocation(request.getLocation());
        existingJob.setDescription(request.getDescription());

        return jobRepository.save(existingJob);
    }

    /*
     * HR closes their own job.
     *
     * Closing does NOT delete the job.
     *
     * CLOSED means:
     * - Candidate cannot see it on dashboard
     * - Candidate cannot apply
     * - HR can still see it
     * - Admin can still see it
     * - Old applications remain safe
     */
    public Job closeJobByHr(String jobId, String hrEmail) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        checkJobOwnership(job, hrEmail, "close");

        job.setStatus("CLOSED");

        return jobRepository.save(job);
    }

    /*
     * HR reopens their own closed job.
     *
     * Reopening changes:
     * CLOSED → OPEN
     *
     * After reopening:
     * - Candidate dashboard will show the job again
     * - Candidate can apply again
     */
    public Job reopenJobByHr(String jobId, String hrEmail) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        checkJobOwnership(job, hrEmail, "reopen");

        job.setStatus("OPEN");

        return jobRepository.save(job);
    }

    /*
     * Admin permanent delete.
     *
     * For HR we will use close job, not delete.
     *
     * Keep this method only for Admin if you want Admin permanent delete.
     */
    public void deleteJob(String id) {

        if (!jobRepository.existsById(id)) {
            throw new RuntimeException("Job not found with id: " + id);
        }

        jobRepository.deleteById(id);
    }

    /*
     * Public search.
     *
     * Candidate should search only OPEN jobs.
     * CLOSED jobs should not appear in candidate search results.
     */
    public List<Job> searchJobs(String keyword) {

        String kw = keyword.toLowerCase();

        return jobRepository.findAll()
                .stream()
                .filter(this::isOpenJob)
                .filter(j ->
                        (j.getTitle() != null && j.getTitle().toLowerCase().contains(kw))
                                || (j.getDescription() != null && j.getDescription().toLowerCase().contains(kw))
                                || (j.getCompany() != null && j.getCompany().toLowerCase().contains(kw))
                )
                .collect(Collectors.toList());
    }

    /*
     * Public location filter.
     *
     * Candidate should get only OPEN jobs for this location.
     */
    public List<Job> getJobsByLocation(String location) {

        return jobRepository.findByLocationIgnoreCase(location)
                .stream()
                .filter(this::isOpenJob)
                .collect(Collectors.toList());
    }

    /*
     * Old fallback recommendation logic.
     *
     * Important:
     * Your actual apply/match score uses FastAPI ML service through MatchScoreService.
     *
     * This method is only for:
     * GET /api/jobs/recommendations/{userId}
     *
     * If frontend is not using recommendations, this method is not important.
     *
     * We also filter only OPEN jobs here because candidates should not get
     * CLOSED jobs as recommendations.
     */
    public List<Map<String, Object>> getBestMatches(String userId) {

        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return Collections.emptyList();
        }

        String resumeContent = userOpt.get().getResumeContent();

        if (resumeContent == null || resumeContent.isBlank()) {
            return Collections.emptyList();
        }

        String[] words = resumeContent.toLowerCase().split("\\W+");
        Set<String> resumeWords = new HashSet<>(Arrays.asList(words));

        List<Job> jobs = jobRepository.findAll()
                .stream()
                .filter(this::isOpenJob)
                .collect(Collectors.toList());

        List<Map<String, Object>> results = new ArrayList<>();

        for (Job job : jobs) {

            String desc = (
                    (job.getTitle() != null ? job.getTitle() : "") + " "
                            + (job.getDescription() != null ? job.getDescription() : "")
            ).toLowerCase();

            String[] jobWords = desc.split("\\W+");

            long matches = Arrays.stream(jobWords)
                    .filter(resumeWords::contains)
                    .count();

            double score = jobWords.length > 0
                    ? Math.min(100.0, (matches * 1.0 / jobWords.length) * 300)
                    : 0;

            Map<String, Object> entry = new HashMap<>();

            entry.put("jobId", job.getId());
            entry.put("title", job.getTitle());
            entry.put("company", job.getCompany());
            entry.put("score", Math.round(score * 100.0) / 100.0);

            results.add(entry);
        }

        results.sort((a, b) ->
                Double.compare((Double) b.get("score"), (Double) a.get("score"))
        );

        return results;
    }

    /*
     * Helper method.
     *
     * This checks whether a job is OPEN.
     *
     * If status is null, we treat it as OPEN because old MongoDB jobs
     * may not have status field.
     */
    private boolean isOpenJob(Job job) {
        return job.getStatus() == null || "OPEN".equalsIgnoreCase(job.getStatus());
    }

    /*
     * Helper method for ownership check.
     *
     * It prevents HR from editing/closing/reopening another HR's job.
     *
     * Example:
     * HR1 can update HR1 job.
     * HR1 cannot update HR2 job.
     */
    private void checkJobOwnership(Job job, String hrEmail, String action) {

        if (job.getPostedByHrEmail() == null ||
                !job.getPostedByHrEmail().equalsIgnoreCase(hrEmail)) {

            throw new AccessDeniedException(
                    "You are not allowed to " + action + " this job"
            );
        }
    }
}