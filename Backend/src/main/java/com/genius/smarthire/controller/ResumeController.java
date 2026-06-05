package com.genius.smarthire.controller;

import com.genius.smarthire.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = "*")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/upload/me")
    public String upload(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        return resumeService.uploadResumeByEmail(authentication.getName(), file);
    }
}