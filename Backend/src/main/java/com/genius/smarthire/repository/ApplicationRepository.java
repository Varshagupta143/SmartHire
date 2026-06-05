package com.genius.smarthire.repository;

import com.genius.smarthire.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {

    List<Application> findByUserId(String userId);

    List<Application> findByJobId(String jobId);

    Optional<Application> findByUserIdAndJobId(String userId, String jobId);
}