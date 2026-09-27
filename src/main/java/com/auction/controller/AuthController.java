package com.auction.controller;

import com.auction.model.User;
import com.auction.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            if (username == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!"));
            }

            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                if (user.getPasswordHash() != null && user.getPasswordHash().equals(password)) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", user.getUserId());
                    response.put("username", user.getUsername());
                    response.put("name", user.getDisplayName());
                    response.put("displayName", user.getDisplayName());

                    String roleStr = user.getRole() != null ? user.getRole().name() : "CUSTOMER";
                    if ("CUSTOMER".equals(roleStr)) {
                        roleStr = "BIDDER";
                    }
                    response.put("role", roleStr);
                    response.put("avatar", user.getAvatar());

                    return ResponseEntity.ok(response);
                }
            }

            return ResponseEntity.status(401).body(Map.of("message", "Sai tên đăng nhập hoặc mật khẩu!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi server: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> regRequest) {
        try {
            String username = regRequest.get("username");
            String password = regRequest.get("password");

            String displayName = regRequest.get("displayName");
            if (displayName == null) {
                displayName = regRequest.get("name");
            }
            if (displayName == null || displayName.trim().isEmpty()) {
                displayName = username;
            }

            if (username == null || password == null || username.trim().isEmpty() || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tên đăng nhập và mật khẩu không được để trống!"));
            }

            if (userRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tên đăng nhập đã tồn tại!"));
            }

            // Tạo user mới
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setPasswordHash(password);
            newUser.setDisplayName(displayName);
            newUser.setRole(User.Role.CUSTOMER); // Mặc định là khách hàng
            newUser.setAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80");

            User savedUser = userRepository.save(newUser);

            // ⚠️ Trả về object chứa thông tin user hệt như API login để Front-end tự lưu localStorage và chuyển trang
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedUser.getUserId());
            response.put("username", savedUser.getUsername());
            response.put("name", savedUser.getDisplayName());
            response.put("displayName", savedUser.getDisplayName());
            response.put("role", "BIDDER"); // Khách hàng sẽ được điều hướng vào Bidder.html?id=101
            response.put("avatar", savedUser.getAvatar());
            response.put("success", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi đăng ký: " + e.getMessage()));
        }
    }
}