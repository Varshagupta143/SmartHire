package com.genius.smarthire.repository;

import com.genius.smarthire.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {
    // Find all jobs a specific candidate applied for
    List<Application> findByUserId(String userId);

    // Find all candidates who applied for a specific job
    List<Application> findByJobId(String jobId);
}