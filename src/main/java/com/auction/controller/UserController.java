package com.auction.controller;

import com.auction.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository; // Thay bằng repository quản lý user thực tế của bạn

    @GetMapping
    public ResponseEntity<List<?>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
