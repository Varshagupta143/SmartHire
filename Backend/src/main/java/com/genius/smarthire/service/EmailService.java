//package com.genius.smarthire.service;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.stereotype.Service;
//
//@Service
//public class EmailService {
//
//    private final JavaMailSender mailSender;
//
//    @Value("${app.mail.from}")
//    private String fromEmail;
//
//    public EmailService(JavaMailSender mailSender) {
//        this.mailSender = mailSender;
//    }
//
//    public void sendApplicationStatusEmail(
//            String toEmail,
//            String candidateName,
//            String jobTitle,
//            String status
//    ) {
//        String subject = "Application Status Update - " + jobTitle;
//
//        String message;
//
//        if ("ACCEPTED".equalsIgnoreCase(status)) {
//            message = "Dear " + candidateName + ",\n\n"
//                    + "Congratulations! Your application for the position \""
//                    + jobTitle + "\" has been accepted.\n\n"
//                    + "The HR team may contact you soon for the next steps.\n\n"
//                    + "Regards,\n"
//                    + "SmartHire Team";
//        } else if ("REJECTED".equalsIgnoreCase(status)) {
//            message = "Dear " + candidateName + ",\n\n"
//                    + "Thank you for applying for the position \""
//                    + jobTitle + "\".\n\n"
//                    + "After reviewing your application, we regret to inform you that you were not selected for this role.\n\n"
//                    + "We encourage you to apply for other suitable opportunities.\n\n"
//                    + "Regards,\n"
//                    + "SmartHire Team";
//        } else {
//            message = "Dear " + candidateName + ",\n\n"
//                    + "Your application status for the position \""
//                    + jobTitle + "\" has been updated to: "
//                    + status + ".\n\n"
//                    + "Regards,\n"
//                    + "SmartHire Team";
//        }
//
//        SimpleMailMessage mailMessage = new SimpleMailMessage();
//
//        mailMessage.setFrom(fromEmail);
//        mailMessage.setTo(toEmail);
//        mailMessage.setSubject(subject);
//        mailMessage.setText(message);
//
//        mailSender.send(mailMessage);
//    }
//    public void sendPasswordResetEmail(String toEmail, String resetLink) {
//        System.out.println("Sending password reset email to: " + toEmail);
//        System.out.println("Reset link: " + resetLink);
//        String subject = "Reset Your SmartHire Password";
//
//        String message = "Hello,\n\n"
//                + "We received a request to reset your SmartHire password.\n\n"
//                + "Click the link below to reset your password:\n"
//                + resetLink + "\n\n"
//                + "This link will expire in 15 minutes.\n\n"
//                + "If you did not request this, please ignore this email.\n\n"
//                + "Regards,\n"
//                + "SmartHire Team";
//
//        SimpleMailMessage mailMessage = new SimpleMailMessage();
//
//        mailMessage.setFrom(fromEmail);
//        mailMessage.setTo(toEmail);
//        mailMessage.setSubject(subject);
//        mailMessage.setText(message);
//
//        mailSender.send(mailMessage);
//        System.out.println("Password reset email sent successfully to: " + toEmail);
//    }
//    public void sendOtpEmail(String toEmail, String otp) {
//        String subject = "SmartHire Login OTP";
//
//        String message = "Hello,\n\n"
//                + "Your SmartHire login OTP is:\n\n"
//                + otp + "\n\n"
//                + "This OTP is valid for 5 minutes.\n\n"
//                + "If you did not try to login, please ignore this email.\n\n"
//                + "Regards,\n"
//                + "SmartHire Team";
//
//        SimpleMailMessage mailMessage = new SimpleMailMessage();
//
//        mailMessage.setFrom(fromEmail);
//        mailMessage.setTo(toEmail);
//        mailMessage.setSubject(subject);
//        mailMessage.setText(message);
//
//        mailSender.send(mailMessage);
//
//        System.out.println("OTP email sent successfully to: " + toEmail);
//    }
//}
package com.genius.smarthire.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private static final String BREVO_EMAIL_URL =
            "https://api.brevo.com/v3/smtp/email";

    private final RestTemplate restTemplate;

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String fromEmail;

    @Value("${brevo.sender.name:SmartHire}")
    private String fromName;

    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void sendApplicationStatusEmail(
            String toEmail,
            String candidateName,
            String jobTitle,
            String status
    ) {
        String subject = "Application Status Update - " + jobTitle;

        String message;

        if ("ACCEPTED".equalsIgnoreCase(status)) {
            message = "Dear " + candidateName + ",\n\n"
                    + "Congratulations! Your application for the position \""
                    + jobTitle + "\" has been accepted.\n\n"
                    + "The HR team may contact you soon for the next steps.\n\n"
                    + "Regards,\nSmartHire Team";
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            message = "Dear " + candidateName + ",\n\n"
                    + "Thank you for applying for the position \""
                    + jobTitle + "\".\n\n"
                    + "After reviewing your application, we regret to inform you "
                    + "that you were not selected for this role.\n\n"
                    + "We encourage you to apply for other suitable opportunities.\n\n"
                    + "Regards,\nSmartHire Team";
        } else {
            message = "Dear " + candidateName + ",\n\n"
                    + "Your application status for the position \""
                    + jobTitle + "\" has been updated to: "
                    + status + ".\n\n"
                    + "Regards,\nSmartHire Team";
        }

        sendViaBrevo(toEmail, subject, message);
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        String subject = "Reset Your SmartHire Password";

        String message = "Hello,\n\n"
                + "We received a request to reset your SmartHire password.\n\n"
                + "Click the link below to reset your password:\n"
                + resetLink + "\n\n"
                + "This link will expire in 15 minutes.\n\n"
                + "If you did not request this, please ignore this email.\n\n"
                + "Regards,\nSmartHire Team";

        sendViaBrevo(toEmail, subject, message);
    }

    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "SmartHire Login OTP";

        String message = "Hello,\n\n"
                + "Your SmartHire login OTP is:\n\n"
                + otp + "\n\n"
                + "This OTP is valid for 5 minutes.\n\n"
                + "If you did not try to login, please ignore this email.\n\n"
                + "Regards,\nSmartHire Team";

        sendViaBrevo(toEmail, subject, message);
    }

    private void sendViaBrevo(String toEmail, String subject, String message) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        Map<String, Object> requestBody = Map.of(
                "sender", Map.of(
                        "name", fromName,
                        "email", fromEmail
                ),
                "to", List.of(
                        Map.of("email", toEmail)
                ),
                "subject", subject,
                "textContent", message
        );

        try {
            restTemplate.postForEntity(
                    BREVO_EMAIL_URL,
                    new HttpEntity<>(requestBody, headers),
                    String.class
            );

            log.info("Brevo accepted email for {}", toEmail);

        } catch (RestClientResponseException e) {
            log.error(
                    "Brevo rejected the email. Status: {}, Response: {}",
                    e.getStatusCode(),
                    e.getResponseBodyAsString()
            );

            throw new IllegalStateException(
                    "Unable to send email right now. Please try again later."
            );

        } catch (Exception e) {
            log.error("Could not send email through Brevo", e);

            throw new IllegalStateException(
                    "Unable to send email right now. Please try again later."
            );
        }
    }
}