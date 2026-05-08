package com.genius.smarthire;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class SmartHireApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartHireApplication.class, args);
    }

    @Bean
    public MongoClient mongoClient() {
        // This forces the connection to Atlas and ignores localhost
        return MongoClients.create("mongodb+srv://vaibhavrathi140_db_user:SmartHire@cluster0.kujxpsh.mongodb.net/SmartHire?retryWrites=true&w=majority");
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), "SmartHire");
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}