package com.genius.smarthire.repository;

import com.genius.smarthire.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ApplicationRepository extends MongoRepository<Application,String> {
}
