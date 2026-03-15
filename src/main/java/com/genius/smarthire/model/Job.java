package com.genius.smarthire.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "jobs")
public class Job {
    @Id
    private String id;
    private String title;
    private String description;
    private List<String> requiredSkills;
    private String company;
    private String location;

}
