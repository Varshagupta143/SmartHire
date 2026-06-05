package com.genius.smarthire.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
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
                    + "Regards,\n"
                    + "SmartHire Team";
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            message = "Dear " + candidateName + ",\n\n"
                    + "Thank you for applying for the position \""
                    + jobTitle + "\".\n\n"
                    + "After reviewing your application, we regret to inform you that you were not selected for this role.\n\n"
                    + "We encourage you to apply for other suitable opportunities.\n\n"
                    + "Regards,\n"
                    + "SmartHire Team";
        } else {
            message = "Dear " + candidateName + ",\n\n"
                    + "Your application status for the position \""
                    + jobTitle + "\" has been updated to: "
                    + status + ".\n\n"
                    + "Regards,\n"
                    + "SmartHire Team";
        }

        SimpleMailMessage mailMessage = new SimpleMailMessage();

        mailMessage.setFrom(fromEmail);
        mailMessage.setTo(toEmail);
        mailMessage.setSubject(subject);
        mailMessage.setText(message);

        mailSender.send(mailMessage);
    }
}