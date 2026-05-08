package com.genius.smarthire.repository;

import com.genius.smarthire.model.Skill;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SkillRepository extends MongoRepository<Skill,String> {
}
