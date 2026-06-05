package com.genius.smarthire.service;

import com.genius.smarthire.model.Job;
import com.genius.smarthire.model.User;
import com.genius.smarthire.repository.JobRepository;
import com.genius.smarthire.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.genius.smarthire.dto.CreateJobRequest;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    // HR/Admin will create job
    // We store which HR/Admin posted this job
    public Job createJob(CreateJobRequest request, String hrEmail) {

        User hr = userRepository.findByEmail(hrEmail)
                .orElseThrow(() -> new RuntimeException("HR user not found"));

        Job job = new Job();

        job.setTitle(request.getTitle());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setDescription(request.getDescription());

        job.setPostedByHrEmail(hr.getEmail());
        job.setPostedByHrId(hr.getId());

        return jobRepository.save(job);
    }

    // Candidate can see all jobs
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    // HR can see only jobs posted by them
    public List<Job> getJobsPostedByHr(String hrEmail) {
        return jobRepository.findByPostedByHrEmail(hrEmail);
    }

    public Optional<Job> getJobById(String id) {
        return jobRepository.findById(id);
    }

    // Delete job only if it exists
    public void deleteJob(String id) {
        if (!jobRepository.existsById(id)) {
            throw new RuntimeException("Job not found with id: " + id);
        }

        jobRepository.deleteById(id);
    }

    public List<Job> searchJobs(String keyword) {
        String kw = keyword.toLowerCase();

        return jobRepository.findAll().stream()
                .filter(j ->
                        (j.getTitle() != null && j.getTitle().toLowerCase().contains(kw))
                                || (j.getDescription() != null && j.getDescription().toLowerCase().contains(kw))
                                || (j.getCompany() != null && j.getCompany().toLowerCase().contains(kw))
                )
                .collect(Collectors.toList());
    }

    public List<Job> getJobsByLocation(String location) {
        return jobRepository.findByLocationIgnoreCase(location);
    }

    public List<Map<String, Object>> getBestMatches(String userId) {

        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return Collections.emptyList();
        }

        String resumeContent = userOpt.get().getResumeContent();

        if (resumeContent == null || resumeContent.isBlank()) {
            return Collections.emptyList();
        }

        String[] words = resumeContent.toLowerCase().split("\\W+");
        Set<String> resumeWords = new HashSet<>(Arrays.asList(words));

        List<Job> jobs = jobRepository.findAll();
        List<Map<String, Object>> results = new ArrayList<>();

        for (Job job : jobs) {

            String desc = (
                    (job.getTitle() != null ? job.getTitle() : "") + " "
                            + (job.getDescription() != null ? job.getDescription() : "")
            ).toLowerCase();

            String[] jobWords = desc.split("\\W+");

            long matches = Arrays.stream(jobWords)
                    .filter(resumeWords::contains)
                    .count();

            double score = jobWords.length > 0
                    ? Math.min(100.0, (matches * 1.0 / jobWords.length) * 300)
                    : 0;

            Map<String, Object> entry = new HashMap<>();

            entry.put("jobId", job.getId());
            entry.put("title", job.getTitle());
            entry.put("company", job.getCompany());
            entry.put("score", Math.round(score * 100.0) / 100.0);

            results.add(entry);
        }

        results.sort((a, b) ->
                Double.compare((Double) b.get("score"), (Double) a.get("score"))
        );

        return results;
    }
}