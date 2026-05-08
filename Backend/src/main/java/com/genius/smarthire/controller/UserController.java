package com.genius.smarthire.controller;

import com.genius.smarthire.model.User;
import com.genius.smarthire.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User created = userService.registerNewUser(user);
            created.setPassword(null); // Never return hashed password
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginDetails) {
        try {
            User user = userService.loginUser(loginDetails.getEmail(), loginDetails.getPassword());
            user.setPassword(null); // Never return hashed password
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            // FIX: Was returning 500 — now correctly returns 401 Unauthorized
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @GetMapping("/search-skill")
    public List<User> searchSkill(@RequestParam String skill) {
        return userService.searchBySkill(skill);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
}