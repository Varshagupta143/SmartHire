package com.genius.smarthire.controller;

import com.genius.smarthire.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = "*")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/upload/{userId}")
    public String upload(@PathVariable String userId, @RequestParam("file") MultipartFile file) throws IOException {
        return resumeService.uploadResume(userId, file);
    }
}