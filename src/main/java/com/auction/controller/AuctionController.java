package com.auction.controller;

import com.auction.model.Auction;
import com.auction.repository.AuctionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/auctions")
@CrossOrigin(origins = "*")
public class AuctionController {
    @Autowired
    private AuctionRepository auctionRepository;

    @GetMapping
    public ResponseEntity<List<Auction>> getAllAuctions() {
        return ResponseEntity.ok(auctionRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Auction> getAuctionById(@PathVariable Long id) {
        return auctionRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Thêm API tạo phòng đấu giá mới
    @PostMapping
    public ResponseEntity<Auction> createAuction(@RequestBody Auction auction) {
        auction.setStatus("ACTIVE");
        auction.setCurrentHighestBid(auction.getStartingPrice());
        auction.setStartTime(LocalDateTime.now());
        Auction savedAuction = auctionRepository.save(auction);
        return ResponseEntity.ok(savedAuction);
    }
}