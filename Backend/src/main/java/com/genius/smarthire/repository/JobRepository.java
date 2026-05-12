package com.genius.smarthire.repository;

import com.genius.smarthire.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface JobRepository extends MongoRepository<Job, String> {

    @Query("{ 'title': { '$regex': ?0, '$options': 'i' } }")
    List<Job> findByTitleRegex(String title);

    List<Job> findByLocationIgnoreCase(String location);
}