package com.genius.smarthire.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "otp_tokens")
public class OtpToken {

    @Id
    private String id;

    // User email for which OTP is generated
    private String email;

    // 6 digit OTP code
    private String otp;

    // OTP expiry time, example: valid for 5 minutes
    private LocalDateTime expiryTime;

    // true means OTP already used once
    private boolean used;

    public OtpToken() {
    }

    public OtpToken(String email, String otp, LocalDateTime expiryTime) {
        this.email = email;
        this.otp = otp;
        this.expiryTime = expiryTime;
        this.used = false;
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getOtp() {
        return otp;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public boolean isUsed() {
        return used;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }
}