package com.genius.smarthire.repository;

import com.genius.smarthire.model.OtpToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OtpTokenRepository extends MongoRepository<OtpToken, String> {

    /*
     * Find latest unused OTP for this email.
     * We use this during OTP verification.
     */
    Optional<OtpToken> findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(String email);
}