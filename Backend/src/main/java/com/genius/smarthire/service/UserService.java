package com.genius.smarthire.service;

import com.genius.smarthire.dto.RegisterRequest;
import com.genius.smarthire.model.User;
import com.genius.smarthire.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerNewUser(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered!");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Public registration should always create normal candidate only
        user.setRole("USER");

        // Never save plain password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(user);
    }

    public User loginUser(String email, String rawPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return user;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    public User createHrUser(String name, String email, String password) {

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered!");
        }

        User hr = new User();
        hr.setName(name);
        hr.setEmail(email);
        hr.setPassword(passwordEncoder.encode(password));
        hr.setRole("HR");

        return userRepository.save(hr);
    }
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElse(null);
    }

    public List<User> searchBySkill(String skill) {
        return userRepository.findBySkill(skill);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}