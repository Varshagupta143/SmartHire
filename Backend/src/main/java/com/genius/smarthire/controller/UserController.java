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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.genius.smarthire.dto.VerifyOtpRequest;
import com.genius.smarthire.service.OtpService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private OtpService otpService;
    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserMapper userMapper;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(
            @Valid @RequestBody RegisterRequest request
    ) {
        User created = userService.registerNewUser(request);

        return ResponseEntity.ok(userMapper.toResponse(created));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request
    ) {
        User user = userService.loginUser(
                request.getEmail(),
                request.getPassword()
        );

        /*
         * Password is correct.
         * But we do not generate JWT yet.
         * First send OTP to email.
         */
        otpService.generateAndSendOtp(user.getEmail());

        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to your email",
                "otpRequired", true,
                "email", user.getEmail()
        ));
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request
    ) {
        /*
         * First verify OTP.
         * If OTP is wrong/expired, exception will be handled by GlobalExceptionHandler.
         */
        otpService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );

        /*
         * OTP is correct.
         * Now generate JWT.
         */
        User user = userService.getUserByEmail(request.getEmail());

        String token = jwtService.generateToken(user);

        AuthResponse response = new AuthResponse(
                token,
                userMapper.toResponse(user)
        );

        return ResponseEntity.ok(response);
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