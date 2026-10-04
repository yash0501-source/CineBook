
package com.cinebook.cinebook.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring()
                .requestMatchers("/posters/**");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Local development and deployed frontend
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://cinebook-frontend-7omv.onrender.com"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})

                .authorizeHttpRequests(auth -> auth

                        // Browser preflight requests
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // Public health and authentication
                        .requestMatchers(
                                "/api/health",
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/profile"
                        ).permitAll()

                        // Public movie APIs
                        .requestMatchers(
                                "/api/movies",
                                "/api/movies/**"
                        ).permitAll()

                        // Public theatre APIs
                        .requestMatchers(
                                "/api/theatres",
                                "/api/theatres/**"
                        ).permitAll()

                        // Public screen APIs
                        .requestMatchers(
                                "/api/screens",
                                "/api/screens/**"
                        ).permitAll()

                        // Public show APIs
                        .requestMatchers(
                                "/api/shows",
                                "/api/shows/**"
                        ).permitAll()

                        // Existing customer booking APIs
                        .requestMatchers(
                                "/api/bookings",
                                "/api/bookings/**"
                        ).permitAll()

                        // Admin APIs require authentication
                        .requestMatchers(
                                "/api/admin/**"
                        ).authenticated()

                        // All remaining endpoints require authentication
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}