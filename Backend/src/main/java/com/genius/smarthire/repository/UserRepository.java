package com.genius.smarthire.repository;

import com.genius.smarthire.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    @Query("{ 'resumeContent': { '$regex': ?0, '$options': 'i' } }")
    List<User> findBySkill(String skill);
}