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
    @Column(name = "auction_id")
    private Long auctionId;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "auctioneer_id")
    private User auctioneer;

    @Column(name = "start_price")
    private Double startPrice;

    @Column(name = "price_step")
    private Double priceStep;

    @Enumerated(EnumType.STRING)
    private Status status; // PENDING, LIVE, ENDED

    @Column(name = "winning_bid")
    private Double winningBid;

    @ManyToOne
    @JoinColumn(name = "winner_id")
    private User winner;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    public enum Status { PENDING, LIVE, ENDED }
}