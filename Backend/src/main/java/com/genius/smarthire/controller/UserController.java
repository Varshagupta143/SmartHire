package com.genius.smarthire.controller;

import com.genius.smarthire.dto.AuthResponse;
import com.genius.smarthire.dto.LoginRequest;
import com.genius.smarthire.dto.RegisterRequest;
import com.genius.smarthire.dto.UserResponse;
import com.genius.smarthire.mapper.UserMapper;
import com.genius.smarthire.model.User;
import com.genius.smarthire.security.JwtService;
import com.genius.smarthire.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserMapper userMapper;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            User created = userService.registerNewUser(request);

            return ResponseEntity.ok(userMapper.toResponse(created));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.loginUser(
                    request.getEmail(),
                    request.getPassword()
            );

            String token = jwtService.generateToken(user);

            AuthResponse response = new AuthResponse(
                    token,
                    userMapper.toResponse(user)
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return userMapper.toResponse(user);
    }

    @GetMapping("/search-skill")
    public List<UserResponse> searchSkill(@RequestParam String skill) {
        return userService.searchBySkill(skill)
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }
}