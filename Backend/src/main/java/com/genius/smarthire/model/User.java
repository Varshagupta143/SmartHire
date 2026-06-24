package com.genius.smarthire.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;
    private String email;
    private String password;
    private String role;

    /*
     * We do NOT store a Cloudinary URL.
     *
     * This is only an internal Cloudinary identifier.
     * Example:
     * smarthire/resumes/user-id/resume-random-id.pdf
     */
    private String resumePublicId;

    /*
     * Example: pdf, docx, doc, txt
     */
    private String resumeFormat;

    /*
     * Used by your ML service for resume-job matching.
     */
    private String resumeContent;

    public User() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getResumePublicId() {
        return resumePublicId;
    }

    public void setResumePublicId(String resumePublicId) {
        this.resumePublicId = resumePublicId;
    }

    public String getResumeFormat() {
        return resumeFormat;
    }

    public void setResumeFormat(String resumeFormat) {
        this.resumeFormat = resumeFormat;
    }

    public String getResumeContent() {
        return resumeContent;
    }

    public void setResumeContent(String resumeContent) {
        this.resumeContent = resumeContent;
    }
}