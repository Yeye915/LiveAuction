package com.auction.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    private String username;
    @Column(name = "password_hash")
    private String passwordHash;
    @Column(name = "display_name")
    private String displayName;

    @Enumerated(EnumType.STRING)
    private Role role; // CUSTOMER, AUCTIONEER
    private String avatar;

    public enum Role { CUSTOMER, AUCTIONEER }
}