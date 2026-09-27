package com.auction.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data                    // Tự động sinh ra Getter, Setter, toString...
@NoArgsConstructor       // Constructor không tham số
@AllArgsConstructor      // Constructor đầy đủ tham số
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    private String role; // Thêm trường role này để phân quyền (BIDDER / AUCTIONEER)
}