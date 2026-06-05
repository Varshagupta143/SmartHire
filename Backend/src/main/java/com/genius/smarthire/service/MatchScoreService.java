package com.genius.smarthire.service;

import com.genius.smarthire.model.Job;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class MatchScoreService {

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public double calculateScore(String resumeContent, Job job) {

        if (resumeContent == null || resumeContent.isBlank()) {
            return 0.0;
        }

        String url = mlServiceUrl + "/rank";

        Map<String, Object> jobMap = new HashMap<>();
        jobMap.put("id", job.getId());
        jobMap.put("title", safe(job.getTitle()));
        jobMap.put("description", safe(job.getDescription()));
        jobMap.put("company", safe(job.getCompany()));
        jobMap.put("location", safe(job.getLocation()));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("resume_content", resumeContent);
        requestBody.put("jobs", List.of(jobMap));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<List> response =
                    restTemplate.postForEntity(url, request, List.class);

            List responseBody = response.getBody();

            if (responseBody == null || responseBody.isEmpty()) {
                throw new RuntimeException("ML service did not return score");
            }

            Map firstResult = (Map) responseBody.get(0);

            Object scoreObj = firstResult.get("score");

            if (scoreObj == null) {
                throw new RuntimeException("Score not found in ML response");
            }

            return Double.parseDouble(scoreObj.toString());

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to get match score from ML service: " + e.getMessage()
            );
        }
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}