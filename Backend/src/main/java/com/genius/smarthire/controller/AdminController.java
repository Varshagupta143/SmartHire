package com.genius.smarthire.controller;

import com.genius.smarthire.dto.CreateHrRequest;
import com.genius.smarthire.mapper.UserMapper;
import com.genius.smarthire.model.User;
import com.genius.smarthire.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService userService;
    private final UserMapper userMapper;

    public AdminController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @PostMapping("/create-hr")
    public ResponseEntity<?> createHr(
            @Valid @RequestBody CreateHrRequest request
    ) {
        User hr = userService.createHrUser(
                request.getName(),
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.ok(Map.of(
                "message", "HR created successfully",
                "hr", userMapper.toResponse(hr)
        ));
    }
}