package com.auction.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "auctions")
@Data
public class Auction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private Double startingPrice;
    private Double currentHighestBid;
    private String currentHighestBidder;
    private String status; // ACTIVE, CLOSED, PENDING
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
}