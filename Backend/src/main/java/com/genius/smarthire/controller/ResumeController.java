package com.genius.smarthire.controller;

import com.genius.smarthire.dto.ResumeDownloadResponse;
import com.genius.smarthire.service.ResumeAccessService;
import com.genius.smarthire.service.ResumeService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final ResumeAccessService resumeAccessService;

    public ResumeController(
            ResumeService resumeService,
            ResumeAccessService resumeAccessService
    ) {
        this.resumeService = resumeService;
        this.resumeAccessService = resumeAccessService;
    }

    @PostMapping("/upload/me")
    public String upload(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        return resumeService.uploadResumeByEmail(
                authentication.getName(),
                file
        );
    }

    /*
     * Candidate downloads only their own resume.
     */
    @GetMapping("/me/download")
    public ResumeDownloadResponse downloadMyResume(
            Authentication authentication
    ) {
        return resumeAccessService.getMyResumeDownloadLink(
                authentication.getName()
        );
    }

    /*
     * HR/Admin requests an applicant resume.
     */
    @GetMapping("/application/{applicationId}/download")
    public ResumeDownloadResponse downloadApplicantResume(
            @PathVariable String applicationId,
            Authentication authentication
    ) {
        return resumeAccessService.getApplicantResumeDownloadLink(
                applicationId,
                authentication.getName()
        );
    }
}