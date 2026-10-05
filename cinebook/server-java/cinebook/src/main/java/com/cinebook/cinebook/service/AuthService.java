package com.cinebook.cinebook.service;

import com.cinebook.cinebook.model.User;
import com.cinebook.cinebook.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // Temporary demo token storage: token -> user ID
    private final Map<String, String> activeTokens =
            new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public Map<String, Object> register(
            String name,
            String email,
            String password
    ) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required.");
        }

        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required.");
        }

        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException(
                    "Password must be at least 6 characters."
            );
        }

        String cleanEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        User user = new User();
        user.setName(name.trim());
        user.setEmail(cleanEmail);
        user.setPassword(passwordEncoder.encode(password));

        // Normal registered users are regular users
        user.setRole("user");

        User savedUser = userRepository.save(user);

        String token = generateToken(savedUser);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Account created successfully.");
        response.put("token", token);
        response.put("user", createSafeUser(savedUser));

        return response;
    }

    public Map<String, Object> login(
            String email,
            String password
    ) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required.");
        }

        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }

        String cleanEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password."
                        )
                );

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        String token = generateToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful.");
        response.put("token", token);
        response.put("user", createSafeUser(user));

        return response;
    }

    private String generateToken(User user) {
        String token = UUID.randomUUID().toString();

        activeTokens.put(
                token,
                user.getId()
        );

        return token;
    }

    public Map<String, Object> getProfile(String token) {

        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Authentication token is missing."
            );
        }

        String userId = activeTokens.get(token);

        if (userId == null) {
            throw new IllegalArgumentException(
                    "Invalid or expired login session. Please log in again."
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User account could not be found."
                        )
                );

        return createSafeUser(user);
    }

    /*
     * Used by TokenAuthenticationFilter.
     *
     * Converts our temporary login token back into
     * the corresponding MongoDB User.
     */
    public User getUserFromToken(String token) {

        if (token == null || token.trim().isEmpty()) {
            return null;
        }

        String userId = activeTokens.get(token);

        if (userId == null) {
            return null;
        }

        return userRepository.findById(userId)
                .orElse(null);
    }

    private Map<String, Object> createSafeUser(User user) {

        Map<String, Object> safeUser = new HashMap<>();

        safeUser.put("id", user.getId());
        safeUser.put("name", user.getName());
        safeUser.put("email", user.getEmail());
        safeUser.put("role", user.getRole());

        return safeUser;
    }
}