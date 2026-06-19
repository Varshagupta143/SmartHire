package com.genius.smarthire.security;

import com.genius.smarthire.model.User;
import com.genius.smarthire.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public OAuth2LoginSuccessHandler(
            UserRepository userRepository,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    /*
     * This runs after Google login is successful.
     *
     * Rule:
     * New Google account -> create as USER
     * Existing USER -> allow login
     * Existing HR/Admin -> block Google login
     */
    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        if (email == null || email.isBlank()) {
            redirectWithError(response, "Google account email not found");
            return;
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setName(name != null ? name : "Google User");
            user.setEmail(email);
            user.setRole("USER");
            user.setPassword(null);

            user = userRepository.save(user);
        } else {
            String role = user.getRole() != null ? user.getRole().toUpperCase() : "";

            if (!role.equals("USER") && !role.equals("CANDIDATE")) {
                redirectWithError(
                        response,
                        "Google login is allowed only for candidates. HR/Admin must use email and password login."
                );
                return;
            }
        }

        String token = jwtService.generateToken(user);
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);

        response.sendRedirect(frontendUrl + "/oauth-success?token=" + encodedToken);
    }

    private void redirectWithError(HttpServletResponse response, String error)
            throws IOException {

        String encodedError = URLEncoder.encode(error, StandardCharsets.UTF_8);

        response.sendRedirect(frontendUrl + "/oauth-success?error=" + encodedError);
    }
}