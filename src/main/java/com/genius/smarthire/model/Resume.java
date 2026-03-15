package com.genius.smarthire.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "resumes")
public class Resume {
    @Id
    private String id;
    private String userId;
    private String name;
    private String email;
    private List<String> skills;
    private String experience;
    private String education;
    private String resumeText;
}
