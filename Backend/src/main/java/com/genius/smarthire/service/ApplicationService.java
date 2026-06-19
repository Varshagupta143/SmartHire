package com.genius.smarthire.service;

import com.genius.smarthire.model.Application;
import com.genius.smarthire.model.Job;
import com.genius.smarthire.model.User;
import com.genius.smarthire.repository.ApplicationRepository;
import com.genius.smarthire.repository.JobRepository;
import com.genius.smarthire.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.genius.smarthire.dto.ApplicationStatusUpdateResult;

import java.util.List;

@Service
public class ApplicationService {

    /*
     * Candidate can apply only if resume-job match score is >= 50%.
     */
    private static final double MINIMUM_MATCH_SCORE = 50.0;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private MatchScoreService matchScoreService;

    /*
     * Candidate applies for a job.
     *
     * Flow:
     * 1. Find logged-in user using email from JWT
     * 2. Find job using jobId
     * 3. Check if job is CLOSED
     * 4. Check resume uploaded or not
     * 5. Check duplicate application
     * 6. Calculate ML score using FastAPI through MatchScoreService
     * 7. Allow apply only if score >= 50
     * 8. Save application with PENDING status
     */
    public Application applyForJob(String userEmail, String jobId) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        /*
         * Important:
         * CLOSED jobs remain in database for Admin/HR history,
         * but candidates should not be allowed to apply.
         *
         * Even if candidate uses Postman manually,
         * backend will block the application.
         */
        if ("CLOSED".equalsIgnoreCase(job.getStatus())) {
            throw new RuntimeException("This job is closed. You cannot apply.");
        }

        if (user.getResumeContent() == null || user.getResumeContent().isBlank()) {
            throw new RuntimeException("Please upload your resume before applying.");
        }

        if (applicationRepository.findByUserIdAndJobId(user.getId(), jobId).isPresent()) {
            throw new RuntimeException("You have already applied for this job.");
        }

        /*
         * This uses your FastAPI ML service through MatchScoreService.
         */
        double score = matchScoreService.calculateScore(user.getResumeContent(), job);

        if (score < MINIMUM_MATCH_SCORE) {
            throw new RuntimeException(
                    "You cannot apply because your resume match score is "
                            + score + "%. Minimum required score is 50%."
            );
        }

        Application application = new Application();
        application.setUserId(user.getId());
        application.setJobId(jobId);
        application.setMatchScore(score);
        application.setStatus("PENDING");

        return applicationRepository.save(application);
    }

    /*
     * Candidate checks match score for a job.
     *
     * Note:
     * We can still allow score checking for CLOSED jobs,
     * but applying is blocked in applyForJob().
     */
    public double getMatchScoreForJob(String userEmail, String jobId) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (user.getResumeContent() == null || user.getResumeContent().isBlank()) {
            throw new RuntimeException("Please upload your resume first.");
        }

        return matchScoreService.calculateScore(user.getResumeContent(), job);
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

    /*
     * HR updates candidate application status.
     *
     * Important:
     * HR can update only applications for jobs posted by that HR.
     */
    public ApplicationStatusUpdateResult updateApplicationStatus(
            String id,
            String status,
            String hrEmail
    ) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Job job = jobRepository.findById(application.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getPostedByHrEmail() == null ||
                !job.getPostedByHrEmail().equalsIgnoreCase(hrEmail)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not allowed to update status for this application"
            );
        }

        String oldStatus = application.getStatus();

        application.setStatus(status);

        Application updatedApplication = applicationRepository.save(application);

        /*
         * Send email only when status actually changes.
         */
        if (oldStatus == null || !status.equalsIgnoreCase(oldStatus)) {
            try {
                User candidate = userRepository.findById(application.getUserId())
                        .orElseThrow(() -> new RuntimeException("Candidate not found"));

                emailService.sendApplicationStatusEmail(
                        candidate.getEmail(),
                        candidate.getName(),
                        job.getTitle(),
                        status
                );

                return new ApplicationStatusUpdateResult(
                        updatedApplication,
                        true,
                        "Status updated and email sent successfully"
                );

            } catch (Exception e) {
                return new ApplicationStatusUpdateResult(
                        updatedApplication,
                        false,
                        "Status updated, but email could not be sent: " + e.getMessage()
                );
            }
        }

        return new ApplicationStatusUpdateResult(
                updatedApplication,
                false,
                "Status already updated. Email was not sent again."
        );
    }

    /*
     * HR can view applicants only for their own job.
     */
    public List<Application> getApplicationsForHrJob(String hrEmail, String jobId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getPostedByHrEmail() == null ||
                !job.getPostedByHrEmail().equalsIgnoreCase(hrEmail)) {
            throw new RuntimeException("You are not allowed to view applicants for this job");
        }

        return applicationRepository.findByJobId(jobId);
    }

    /*
     * Candidate can see their own applications.
     */
    public List<Application> getApplicationsByUserEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return applicationRepository.findByUserId(user.getId());
    }
}