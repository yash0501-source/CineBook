
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

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
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

                        // Allow browser preflight requests
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // Public health and authentication endpoints
                        .requestMatchers(
                                "/api/health",
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/profile"
                        ).permitAll()

                        // Public movie endpoints
                        .requestMatchers(
                                "/api/movies",
                                "/api/movies/**"
                        ).permitAll()

                        // Public theatre endpoints
                        .requestMatchers(
                                "/api/theatres",
                                "/api/theatres/**"
                        ).permitAll()

                        // Public screen endpoints
                        .requestMatchers(
                                "/api/screens",
                                "/api/screens/**"
                        ).permitAll()

                        // Public show endpoints
                        .requestMatchers(
                                "/api/shows",
                                "/api/shows/**"
                        ).permitAll()

                        // Customer booking operations
                        .requestMatchers(
                                "/api/bookings",
                                "/api/bookings/**"
                        ).permitAll()

                        // Debug endpoints
                        .requestMatchers(
                                "/api/debug",
                                "/api/debug/**"
                        ).permitAll()

                        // Admin development endpoints
                        .requestMatchers(
                                "/api/admin/dashboard",
                                "/api/admin/bookings",
                                "/api/admin/bookings/**"
                        ).permitAll()

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}