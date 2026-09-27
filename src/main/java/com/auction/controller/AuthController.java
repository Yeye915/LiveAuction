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
@CrossOrigin(origins = "*") // Cho phép Front-end gọi API không bị lỗi CORS
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // API Đăng ký tài khoản mới
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Kiểm tra xem tên đăng nhập đã tồn tại chưa
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Tên đăng nhập đã tồn tại trong hệ thống!");
            return ResponseEntity.badRequest().body(error);
        }

        // Mặc định tài khoản đăng ký mới là khách hàng (BIDDER)
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("BIDDER");
        }

        // Nếu chưa có full_name thì gán bằng username
        if (user.getFullName() == null || user.getFullName().isEmpty()) {
            user.setFullName(user.getUsername());
        }

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đăng ký thành công!");
        return ResponseEntity.ok(response);
    }

    // API Đăng nhập hệ thống
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(loginRequest.getPassword())) {
            User user = userOpt.get();

            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            response.put("displayName", user.getFullName() != null ? user.getFullName() : user.getUsername());
            response.put("role", user.getRole()); // Trả về 'AUCTIONEER' hoặc 'BIDDER' để JS phân quyền
            response.put("token", "mock-jwt-token-secure");

            return ResponseEntity.ok(response);
        }

        Map<String, String> error = new HashMap<>();
        error.put("message", "Tên đăng nhập hoặc mật khẩu không chính xác!");
        return ResponseEntity.status(401).body(error);
    }
}