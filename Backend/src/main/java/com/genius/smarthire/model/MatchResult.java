package com.genius.smarthire.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "match_results")
public class MatchResult {
    @Id
    private String id;
    private String jobId;
    private String resumeId;
    private double similarityScore;
}
