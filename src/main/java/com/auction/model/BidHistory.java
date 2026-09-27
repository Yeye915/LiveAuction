package com.auction.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "bid_history")
@Data
public class BidHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bid_id")
    private Long bidId;

    @Column(name = "auction_id")
    private Long auctionId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "bid_amount")
    private Double bidAmount;

    @Column(name = "bid_time")
    private LocalDateTime bidTime = LocalDateTime.now();
}