package com.genius.smarthire.repository;

import com.genius.smarthire.model.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResumeRepository extends MongoRepository<Resume,String> {
}
