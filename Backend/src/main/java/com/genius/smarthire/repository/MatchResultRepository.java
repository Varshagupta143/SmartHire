package com.genius.smarthire.repository;

import com.genius.smarthire.model.MatchResult;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MatchResultRepository  extends MongoRepository<MatchResult,String> {
}
