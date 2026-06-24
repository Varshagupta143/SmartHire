package com.genius.smarthire.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.genius.smarthire.model.User;
import com.genius.smarthire.repository.UserRepository;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class ResumeService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("pdf", "doc", "docx", "txt");

    private final UserRepository userRepository;
    private final Cloudinary cloudinary;
    private final Tika tika = new Tika();

    public ResumeService(
            UserRepository userRepository,
            Cloudinary cloudinary
    ) {
        this.userRepository = userRepository;
        this.cloudinary = cloudinary;
    }

    public String uploadResumeByEmail(
            String email,
            MultipartFile file
    ) throws IOException {

        validateResume(file);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String originalFileName = getCleanFileName(file);
        String extension = getExtension(originalFileName);

        /*
         * Read once because:
         * 1. Tika needs it to extract text.
         * 2. Cloudinary needs it to upload.
         *
         * Safe because resume limit is 5 MB.
         */
        byte[] fileBytes = file.getBytes();

        String extractedText;

        try (InputStream parseStream =
                     new ByteArrayInputStream(fileBytes)) {

            extractedText = tika.parseToString(parseStream);

        } catch (Exception e) {
            throw new RuntimeException(
                    "Could not extract text from this resume."
            );
        }

        if (extractedText == null || extractedText.isBlank()) {
            throw new RuntimeException(
                    "No readable text was found in the resume. "
                            + "Please upload a text-based PDF, DOC, DOCX, or TXT file."
            );
        }

        String oldPublicId = user.getResumePublicId();

        /*
         * Do not use candidate file name in public ID.
         * We use random UUID to avoid exposing personal data.
         *
         * Raw Cloudinary public IDs must include file extension.
         */
        String newPublicId =
                "smarthire/resumes/"
                        + user.getId()
                        + "/resume-"
                        + UUID.randomUUID()
                        + "."
                        + extension;

        Map<?, ?> uploadResult;

        try {
            uploadResult = cloudinary.uploader().upload(
                    fileBytes,

                    ObjectUtils.asMap(
                            "resource_type", "raw",

                            /*
                             * Critical security setting:
                             * Resume cannot be opened through a normal URL.
                             */
                            "type", "authenticated",

                            "public_id", newPublicId,

                            "overwrite", false,

                            "allowed_formats",
                            List.of("pdf", "doc", "docx", "txt")
                    )
            );

        } catch (Exception e) {
            throw new RuntimeException(
                   "Cloudinary resume upload failed."
           );
        }



        String uploadedPublicId =
                String.valueOf(uploadResult.get("public_id"));

        try {
            /*
             * Store only Cloudinary identifier.
             * Do not store secure_url or any permanent download URL.
             */
            user.setResumePublicId(uploadedPublicId);
            user.setResumeFormat(extension);
            user.setResumeContent(extractedText);

            userRepository.save(user);

        } catch (Exception e) {

            /*
             * Database save failed after Cloudinary upload.
             * Remove newly uploaded file to avoid orphan file.
             */
            deleteCloudinaryResume(uploadedPublicId);

            throw new RuntimeException(
                    "Could not save resume information."
            );
        }

        /*
         * Candidate uploaded a replacement resume.
         * Delete old resume only after the new resume is saved.
         */
        if (oldPublicId != null &&
                !oldPublicId.isBlank() &&
                !oldPublicId.equals(uploadedPublicId)) {

            deleteCloudinaryResume(oldPublicId);
        }

        return "Resume uploaded securely. Extracted "
                + extractedText.length()
                + " characters.";
    }

    private void deleteCloudinaryResume(String publicId) {

        try {
            cloudinary.uploader().destroy(
                    publicId,

                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "type", "authenticated",
                            "invalidate", true
                    )
            );

        } catch (Exception ignored) {
            /*
             * Do not fail a successful new upload
             * just because deleting an older file fails.
             */
        }
    }

    private void validateResume(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a resume file."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Resume must be 5 MB or smaller."
            );
        }

        String extension = getExtension(getCleanFileName(file));

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    "Only PDF, DOC, DOCX, and TXT resumes are allowed."
            );
        }
    }

    private String getCleanFileName(MultipartFile file) {

        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || originalFileName.isBlank()) {
            throw new IllegalArgumentException(
                    "Resume file name is missing."
            );
        }

        String cleanFileName =
                StringUtils.cleanPath(originalFileName);

        if (cleanFileName.contains("..")) {
            throw new IllegalArgumentException(
                    "Invalid resume file name."
            );
        }

        return cleanFileName;
    }

    private String getExtension(String fileName) {

        int dotIndex = fileName.lastIndexOf('.');

        if (dotIndex < 1 || dotIndex == fileName.length() - 1) {
            throw new IllegalArgumentException(
                    "Resume must have a valid file extension."
            );
        }

        return fileName.substring(dotIndex + 1)
                .toLowerCase(Locale.ROOT);
    }
}