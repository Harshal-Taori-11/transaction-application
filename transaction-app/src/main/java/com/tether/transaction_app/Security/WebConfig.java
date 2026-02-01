package com.tether.transaction_app.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Apply CORS to all endpoints
                        // ✅ Whitelist: allow only these frontend origins
                        .allowedOrigins(
                                "http://localhost:5173", // React dev server
                                "https://your-production-domain.com" // Production frontend
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(true); // Needed for cookies or Authorization headers
            }
        };
    }
}
