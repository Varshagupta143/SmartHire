package com.genius.smarthire.service;

import com.genius.smarthire.model.OtpToken;
import com.genius.smarthire.repository.OtpTokenRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;

    public OtpService(OtpTokenRepository otpTokenRepository, EmailService emailService) {
        this.otpTokenRepository = otpTokenRepository;
        this.emailService = emailService;
    }

    /*
     * Generate and send OTP.
     *
     * OTP is valid for 5 minutes.
     */
    public void generateAndSendOtp(String email) {
        String otp = generateSixDigitOtp();

        OtpToken otpToken = new OtpToken(
                email,
                otp,
                LocalDateTime.now().plusMinutes(5)
        );

        otpTokenRepository.save(otpToken);

        emailService.sendOtpEmail(email, otp);

        // Useful for local testing
        System.out.println("Login OTP for " + email + " is: " + otp);
    }

    /*
     * Verify OTP entered by user.
     */
    public void verifyOtp(String email, String otp) {
        OtpToken otpToken = otpTokenRepository
                .findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(email)
                .orElseThrow(() -> new RuntimeException("OTP not found or already used"));

        if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired. Please login again.");
        }

        if (!otpToken.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);
    }

    private String generateSixDigitOtp() {
        int number = new Random().nextInt(900000) + 100000;
        return String.valueOf(number);
    }
}