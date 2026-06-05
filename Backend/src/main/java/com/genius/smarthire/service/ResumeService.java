package com.genius.smarthire.service;

import com.genius.smarthire.model.User;
import com.genius.smarthire.repository.UserRepository;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.UUID;

@Service
public class ResumeService {

    @Autowired
    private UserRepository userRepository;

    private final String uploadDir = "uploads/resumes/";

    private final Tika tika = new Tika();

    public String uploadResumeByEmail(String email, MultipartFile file) throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalName = file.getOriginalFilename();
        String fileName = UUID.randomUUID() + "-" + originalName;

        Path filePath = uploadPath.resolve(fileName);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        String extractedText;

        try (InputStream parseStream = Files.newInputStream(filePath)) {
            extractedText = tika.parseToString(parseStream);
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text from resume: " + e.getMessage());
        }

        user.setResumePath(filePath.toString());
        user.setResumeContent(extractedText);

        userRepository.save(user);

        return "Success: Extracted " + extractedText.length() + " characters.";
    }
}