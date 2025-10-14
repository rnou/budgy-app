package com.budgy.backend.controllers;

import com.budgy.backend.dto.LoginRequest;
import com.budgy.backend.dto.UserDTO;
import com.budgy.backend.dto.response.LoginResponse;
import com.budgy.backend.dto.response.UserResponseDTO;
import com.budgy.backend.security.JwtUtil;
import com.budgy.backend.security.UserDetailsImpl;
import com.budgy.backend.services.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication Controller
 * <p>
 * Handles authentication-related endpoints: login, register, and token validation.
 */
@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    /**
     * Login Endpoint
     * <p>
     * POST /api/v1/auth/login
     * Request Body: { "email": "user@example.com", "password": "password123" }
     * Response: { "token": "jwt-token", "type": "Bearer", "email": "...", "name": "...", "userId": 1 }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Create authentication token
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    );

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(authenticationToken);

            // Get authenticated user details
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Generate JWT token
            String jwt = jwtUtil.generateToken(userDetails);

            // Get additional user info
            UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;

            // Build response
            LoginResponse response = LoginResponse.builder()
                    .token(jwt)
                    .type("Bearer")
                    .email(userDetails.getUsername())
                    .name(userDetailsImpl.getUser().getName())
                    .userId(userDetailsImpl.getUser().getId())
                    .build();

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("error", "Invalid email or password"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(500)
                    .body(Map.of("error", "An error occurred during authentication: " + e.getMessage()));
        }
    }

    /**
     * Register Endpoint
     * <p>
     * POST /api/v1/auth/register
     * Request Body: { "name": "John Doe", "email": "user@example.com", "password": "password123" }
     * Response: { "token": "jwt-token", "type": "Bearer", "email": "...", "name": "...", "userId": 1 }
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserDTO userDTO) {
        try {
            // Create user
            UserResponseDTO createdUser = userService.createUser(userDTO);

            // Auto-login: Load user details and generate token
            UserDetails userDetails = userService.loadUserByUsername(userDTO.getEmail());
            String jwt = jwtUtil.generateToken(userDetails);

            // Build response
            LoginResponse response = LoginResponse.builder()
                    .token(jwt)
                    .type("Bearer")
                    .email(createdUser.getEmail())
                    .name(createdUser.getName())
                    .userId(createdUser.getId())
                    .build();

            return ResponseEntity.status(201).body(response);

        } catch (Exception e) {
            return ResponseEntity
                    .status(400)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Validate Token Endpoint
     * <p>
     * GET /api/v1/auth/validate-token
     * Headers: Authorization: Bearer <jwt-token>
     * Response: { "valid": true, "user": { "id": 1, "name": "...", "email": "..." } }
     */
    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            // Extract token from header
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("valid", false);
                errorResponse.put("message", "Missing or invalid Authorization header");
                return ResponseEntity.status(401).body(errorResponse);
            }

            String token = authorizationHeader.substring(7);

            // Extract username from token
            String username = jwtUtil.extractUsername(token);

            // Load user details
            UserDetails userDetails = userService.loadUserByUsername(username);

            // Validate token
            if (jwtUtil.validateToken(token, userDetails)) {
                UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
                com.budgy.backend.entities.User user = userDetailsImpl.getUser();

                // Build success response
                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "initials", user.getInitials() != null ? user.getInitials() : "",
                        "currentBalance", user.getCurrentBalance()
                ));

                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("valid", false);
                errorResponse.put("message", "Token is invalid or expired");
                return ResponseEntity.status(401).body(errorResponse);
            }

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valid", false);
            errorResponse.put("message", "Token validation failed: " + e.getMessage());
            return ResponseEntity.status(401).body(errorResponse);
        }
    }
}