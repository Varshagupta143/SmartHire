package com.genius.smarthire.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "applications")
public class Application {
    @Id
    private String id;
    private String jobId;
    private String userId;
    private String resumeId;
    private double matchScore;
    private String status;

}
