package com.genius.smarthire.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.genius.smarthire.dto.ResumeDownloadResponse;
import com.genius.smarthire.model.Application;
import com.genius.smarthire.model.Job;
import com.genius.smarthire.model.User;
import com.genius.smarthire.repository.ApplicationRepository;
import com.genius.smarthire.repository.JobRepository;
import com.genius.smarthire.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ResumeAccessService {

    private static final long LINK_VALIDITY_SECONDS = 5 * 60;

    private final Cloudinary cloudinary;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    public ResumeAccessService(
            Cloudinary cloudinary,
            UserRepository userRepository,
            ApplicationRepository applicationRepository,
            JobRepository jobRepository
    ) {
        this.cloudinary = cloudinary;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
    }

    /*
     * Candidate can download only their own resume.
     */
    public ResumeDownloadResponse getMyResumeDownloadLink(
            String candidateEmail
    ) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return createTemporaryLink(candidate);
    }

    /*
     * HR can download resume only when:
     * 1. Candidate applied to a job.
     * 2. That job belongs to this HR.
     *
     * Admin can download any candidate resume.
     */
    public ResumeDownloadResponse getApplicantResumeDownloadLink(
            String applicationId,
            String requesterEmail
    ) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Job job = jobRepository.findById(application.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        boolean isAdmin =
                "ADMIN".equalsIgnoreCase(requester.getRole());

        boolean isOwnerHr =
                "HR".equalsIgnoreCase(requester.getRole())
                        && job.getPostedByHrEmail() != null
                        && job.getPostedByHrEmail()
                        .equalsIgnoreCase(requester.getEmail());

        if (!isAdmin && !isOwnerHr) {
            throw new AccessDeniedException(
                    "You are not allowed to download this resume."
            );
        }

        User candidate = userRepository.findById(application.getUserId())
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        return createTemporaryLink(candidate);
    }

    private ResumeDownloadResponse createTemporaryLink(
            User candidate
    ) {
        if (candidate.getResumePublicId() == null ||
                candidate.getResumePublicId().isBlank() ||
                candidate.getResumeFormat() == null ||
                candidate.getResumeFormat().isBlank()) {

            throw new RuntimeException(
                    "This candidate has not uploaded a secure resume yet."
            );
        }

        long expiresAt = Instant.now()
                .plusSeconds(LINK_VALIDITY_SECONDS)
                .getEpochSecond();

        try {
            String temporaryUrl = cloudinary.privateDownload(
                    candidate.getResumePublicId(),
                    candidate.getResumeFormat(),

                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "type", "authenticated",
                            "expires_at", expiresAt,
                            "attachment", true
                    )
            );

            return new ResumeDownloadResponse(
                    temporaryUrl,
                    expiresAt
            );

        } catch (Exception e) {
            throw new RuntimeException(
                    "Could not create secure resume download link."
            );
        }
    }
}