package com.genius.smarthire.service;

import com.genius.smarthire.model.User;
import com.genius.smarthire.repository.UserRepository;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ResumeService {

    @Autowired
    private UserRepository userRepository;

    private final String uploadDir = "uploads/resumes/";
    private final Tika tika = new Tika();

    public String uploadResume(String userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        String extractedText;
        try (InputStream parseStream = Files.newInputStream(filePath)) {
            extractedText = tika.parseToString(parseStream);
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text from PDF: " + e.getMessage());
        }

        user.setResumePath(filePath.toString());
        user.setResumeContent(extractedText);
        userRepository.save(user);

        return "Success: Extracted " + extractedText.length() + " characters.";
    }
}