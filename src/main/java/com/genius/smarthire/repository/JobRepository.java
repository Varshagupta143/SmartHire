package com.genius.smarthire.repository;

import com.genius.smarthire.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface JobRepository extends MongoRepository<Job,String> {
}
