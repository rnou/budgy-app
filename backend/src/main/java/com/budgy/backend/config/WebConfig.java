package com.budgy.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Web Configuration
 *
 * Configures CORS to allow frontend to communicate with backend.
 */
@Configuration
public class WebConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Allow specific origins (your frontend URLs)
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",  // Vite default
                "http://localhost:3000",  // React default
                "http://localhost:4200"   // Angular default
        ));

        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Allow specific HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        // Expose headers to the client
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization", "Content-Type"
        ));

        // How long the response from a pre-flight request can be cached (1 hour)
        configuration.setMaxAge(3600L);

        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}