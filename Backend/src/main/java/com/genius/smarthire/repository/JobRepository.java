package com.genius.smarthire.repository;

import com.genius.smarthire.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface JobRepository extends MongoRepository<Job, String> {

    /*
     * Search jobs by title using regex.
     * This is case-insensitive because of '$options': 'i'.
     */
    @Query("{ 'title': { '$regex': ?0, '$options': 'i' } }")
    List<Job> findByTitleRegex(String title);

    /*
     * Find jobs by location.
     * Example: "Indore" and "indore" both will match.
     */
    List<Job> findByLocationIgnoreCase(String location);

    /*
     * Find jobs posted by a particular HR.
     * Used in HR Dashboard so HR can see only their own jobs.
     */
    List<Job> findByPostedByHrEmail(String email);

    /*
     * Find jobs by status.
     *
     * OPEN:
     * Candidate dashboard should show only OPEN jobs.
     *
     * CLOSED:
     * Closed jobs remain in database but should not be shown to candidates.
     */
    List<Job> findByStatusIgnoreCase(String status);
}