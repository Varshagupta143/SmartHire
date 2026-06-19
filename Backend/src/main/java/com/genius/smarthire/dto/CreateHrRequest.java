package com.genius.smarthire.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateHrRequest {

    @NotBlank(message = "HR name is required")
    private String name;

    @NotBlank(message = "HR email is required")
    @Email(message = "HR email should be valid")
    private String email;

    @NotBlank(message = "HR password is required")
    @Size(min = 6, message = "HR password must be at least 6 characters")
    private String password;

    public CreateHrRequest() {
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}