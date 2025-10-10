package com.budgy.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT Utility Class
 *
 * Handles all JWT operations: generation, validation, and extraction of information.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        validateTokenFormat(token);
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Validates JWT token format to ensure strict Base64 encoding
     */
    private void validateTokenFormat(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new io.jsonwebtoken.MalformedJwtException("JWT must have 3 parts");
        }

        String signature = parts[2];
        if (signature.length() > 0) {
            try {
                byte[] decoded = java.util.Base64.getUrlDecoder().decode(signature);
                String canonical = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(decoded);

                if (!signature.equals(canonical)) {
                    throw new io.jsonwebtoken.security.SignatureException(
                            "JWT signature has invalid Base64 padding - token may have been tampered with"
                    );
                }
            } catch (IllegalArgumentException e) {
                throw new io.jsonwebtoken.MalformedJwtException("Invalid Base64 encoding in signature");
            }
        }
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();

        if (userDetails instanceof UserDetailsImpl) {
            UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
            com.budgy.backend.entities.User user = userDetailsImpl.getUser();

            claims.put("id", user.getId());
            claims.put("name", user.getName());
            claims.put("email", user.getEmail());
            claims.put("initials", user.getInitials());
        }

        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}