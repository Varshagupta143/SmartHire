package com.genius.smarthire.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "skills")
public class Skill {
    @Id
    private String id;
    private String name;
}
