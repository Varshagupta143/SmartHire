package com.genius.smarthire.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                /*
                 * CSRF is disabled because we are using REST APIs + JWT.
                 */
                .csrf(csrf -> csrf.disable())

                /*
                 * Allows React frontend to call Spring Boot backend.
                 */
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                /*
                 * For normal JWT APIs, we do not depend on session.
                 *
                 * But Google OAuth needs a temporary session during redirect flow.
                 * So we use IF_REQUIRED instead of STATELESS.
                 */
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * Public auth APIs.
                         */
                        .requestMatchers(HttpMethod.POST, "/api/users/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users/verify-otp").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/forgot-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/reset-password").permitAll()

                        /*
                         * Google OAuth endpoints.
                         *
                         * /oauth2/authorization/google starts Google login.
                         * /login/oauth2/code/google receives Google callback.
                         */
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()

                        /*
                         * Browser preflight request.
                         */
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        /*
                         * Admin can see all jobs: OPEN + CLOSED.
                         */
                        .requestMatchers(HttpMethod.GET, "/api/jobs/all").hasRole("ADMIN")

                        /*
                         * HR can see only their own jobs.
                         */
                        .requestMatchers(HttpMethod.GET, "/api/jobs/my-jobs").hasRole("HR")

                        /*
                         * Public candidate job browsing.
                         */
                        .requestMatchers(HttpMethod.GET, "/api/jobs").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/jobs/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/jobs/location/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/jobs/recommendations/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/jobs/*").permitAll()

                        /*
                         * HR job management.
                         */
                        .requestMatchers(HttpMethod.POST, "/api/jobs").hasRole("HR")
                        .requestMatchers(HttpMethod.PUT, "/api/jobs/**").hasRole("HR")
                        .requestMatchers(HttpMethod.PATCH, "/api/jobs/**").hasRole("HR")

                        /*
                         * Admin permanent delete.
                         */
                        .requestMatchers(HttpMethod.DELETE, "/api/jobs/**").hasRole("ADMIN")

                        /*
                         * Candidate APIs.
                         */
                        .requestMatchers(HttpMethod.POST, "/api/resumes/**").hasAnyRole("USER", "CANDIDATE")
                        .requestMatchers(HttpMethod.POST, "/api/applications/apply").hasAnyRole("USER", "CANDIDATE")
                        .requestMatchers(HttpMethod.GET, "/api/applications/score/**").hasAnyRole("USER", "CANDIDATE")
                        .requestMatchers(HttpMethod.GET, "/api/applications/me").hasAnyRole("USER", "CANDIDATE")

                        /*
                         * HR/Admin application APIs.
                         */
                        .requestMatchers(HttpMethod.GET, "/api/applications/job/**").hasAnyRole("HR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/applications/**").hasAnyRole("HR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/applications").hasAnyRole("HR", "ADMIN")

                        /*
                         * Admin APIs.
                         */
                        .requestMatchers(HttpMethod.POST, "/api/admin/create-hr").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")

                        /*
                         * Logged-in user APIs.
                         */
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()

                        /*
                         * Everything else requires login.
                         */
                        .anyRequest().authenticated()
                )

                /*
                 * Google OAuth login configuration.
                 *
                 * After Google login succeeds, our custom handler:
                 * - creates/fetches USER
                 * - blocks HR/Admin Google login
                 * - generates JWT
                 * - redirects to frontend
                 */
                .oauth2Login(oauth -> oauth
                        .successHandler(oAuth2LoginSuccessHandler)
                )

                /*
                 * JWT filter for normal API requests.
                 */
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
        ));

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type"
        ));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }
}