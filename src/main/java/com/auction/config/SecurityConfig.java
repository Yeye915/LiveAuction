package com.auction.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF cho WebSocket/API
                .cors(cors -> {}) // Bật CORS
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/ws-auction/**").permitAll() // Cho phép truy cập công khai endpoint Socket
                        .anyRequest().permitAll() // Tùy chỉnh các request khác nếu cần (đang mở công khai phục vụ demo)
                );

        return http.build();
    }
}
