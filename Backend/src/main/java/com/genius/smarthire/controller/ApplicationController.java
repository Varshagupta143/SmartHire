package com.genius.smarthire.controller;

import com.genius.smarthire.dto.ApplicationResponse;
import com.genius.smarthire.mapper.ApplicationMapper;
import com.genius.smarthire.model.Application;
import com.genius.smarthire.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.genius.smarthire.service.UserService;
import com.genius.smarthire.dto.ApplyJobRequest;
import com.genius.smarthire.dto.UpdateApplicationStatusRequest;
import com.genius.smarthire.dto.ApplicationStatusUpdateResult;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;
    @Autowired
    private UserService userService;
    @Autowired
    private ApplicationMapper applicationMapper;

    @PostMapping("/apply")
    public ResponseEntity<?> apply(
            @Valid @RequestBody ApplyJobRequest request,
            Authentication authentication
    ) {
        try {
            Application saved = applicationService.applyForJob(
                    authentication.getName(),
                    request.getJobId()
            );

            return ResponseEntity.ok(applicationMapper.toResponse(saved));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/score/{jobId}")
    public ResponseEntity<?> getScore(
            @PathVariable String jobId,
            Authentication authentication
    ) {
        try {
            double score = applicationService.getMatchScoreForJob(
                    authentication.getName(),
                    jobId
            );

            return ResponseEntity.ok(Map.of(
                    "score", score,
                    "eligible", score >= 50
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getByJob(
            @PathVariable String jobId,
            Authentication authentication
    ) {
        try {
            return ResponseEntity.ok(
                    applicationService.getApplicationsForHrJob(
                                    authentication.getName(),
                                    jobId
                            )
                            .stream()
                            .map(app -> applicationMapper.toResponse(
                                    app,
                                    userService.getUserById(app.getUserId())
                            ))
                            .toList()
            );

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public List<ApplicationResponse> getByUser(@PathVariable String userId) {
        return applicationService.getApplicationsByUser(userId)
                .stream()
                .map(applicationMapper::toResponse)
                .toList();
    }

    @GetMapping("/me")
    public List<ApplicationResponse> getMyApplications(Authentication authentication) {
        return applicationService.getApplicationsByUserEmail(authentication.getName())
                .stream()
                .map(applicationMapper::toResponse)
                .toList();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        ApplicationStatusUpdateResult result =
                applicationService.updateApplicationStatus(
                        id,
                        request.getStatus()
                );

        return ResponseEntity.ok(Map.of(
                "application", applicationMapper.toResponse(
                        result.getApplication(),
                        userService.getUserById(result.getApplication().getUserId())
                ),
                "emailSent", result.isEmailSent(),
                "message", result.getMessage()
        ));
    }

    @GetMapping
    public List<ApplicationResponse> getAll() {
        return applicationService.getAllApplications()
                .stream()
                .map(applicationMapper::toResponse)
                .toList();
    }
}