package com.auction.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @ManyToOne
    @JoinColumn(name = "auctioneer_id")
    private User auctioneer;

    @Column(name = "product_name")
    private String productName;

    private String description;
    private String material;
    private String dimensions;

    @Column(name = "condition_pct")
    private Integer conditionPct;

    @Column(name = "image_url")
    private String imageUrl;
}