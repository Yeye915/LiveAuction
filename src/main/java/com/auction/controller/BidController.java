package com.auction.controller;

import com.auction.model.Auction;
import com.auction.repository.AuctionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bids")
@CrossOrigin(origins = "*")
public class BidController {

    @Autowired
    private AuctionRepository auctionRepository;

    @PostMapping
    public ResponseEntity<?> placeBid(@RequestBody Map<String, Object> bidRequest) {
        try {
            Long auctionId = Long.valueOf(bidRequest.get("auctionId").toString());
            Double amount = Double.valueOf(bidRequest.get("amount").toString());
            String userName = (String) bidRequest.get("userName");

            // Tìm phòng đấu giá trong Database
            Optional<Auction> auctionOpt = auctionRepository.findById(auctionId);
            if (auctionOpt.isPresent()) {
                Auction auction = auctionOpt.get();

                // Cập nhật giá cao nhất và người dẫn đầu mới vào Database
                auction.setCurrentHighestBid(amount);
                if (userName != null) {
                    auction.setCurrentHighestBidder(userName);
                }
                auctionRepository.save(auction); // Lưu thay đổi vào MySQL

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Ra giá thành công và đã cập nhật DB!");
                response.put("amount", amount);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy phiên đấu giá ID: " + auctionId));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi server: " + e.getMessage()));
        }
    }
}