package com.budgy.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);

        // Allow specific origins (your frontend URLs)
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",  // Vite default port
                "http://localhost:3000",  // Create React App default port
                "http://localhost:4200"   // Angular default port
        ));

        // Allow all headers
        config.addAllowedHeader("*");

        // Allow specific HTTP methods
        config.setAllowedMethods(Arrays.asList(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
        ));

        // Expose headers to the client
        config.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Total-Count"
        ));

        // How long the response from a pre-flight request can be cached (1 hour)
        config.setMaxAge(3600L);

        // Apply CORS configuration to all endpoints
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}