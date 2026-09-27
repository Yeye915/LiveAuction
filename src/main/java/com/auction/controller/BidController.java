package com.auction.controller;

import com.auction.model.BidHistory;
import com.auction.model.User;
import com.auction.repository.BidHistoryRepository;
import com.auction.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bids")
@CrossOrigin(origins = "*")
public class BidController {

    @Autowired
    private BidHistoryRepository bidHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> placeBid(@RequestBody Map<String, Object> bidRequest) {
        try {
            Long auctionId = Long.valueOf(bidRequest.get("auctionId").toString());
            Double amount = Double.valueOf(bidRequest.get("amount").toString());
            Object userIdObj = bidRequest.get("userId");

            BidHistory bid = new BidHistory();
            bid.setAuctionId(auctionId);
            bid.setBidAmount(amount);

            if (userIdObj != null) {
                try {
                    Long userId = Long.valueOf(userIdObj.toString());
                    Optional<User> userOpt = userRepository.findById(userId);
                    userOpt.ifPresent(bid::setUser);
                } catch (Exception ignored) {}
            }

            // Nếu user chưa được gán qua ID, lấy user mặc định (vd: user số 2 - Nhi)
            if (bid.getUser() == null) {
                userRepository.findById(2L).ifPresent(bid::setUser);
            }

            bidHistoryRepository.save(bid);

            return ResponseEntity.ok(Map.of("success", true, "message", "Ra giá thành công vào database!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi server: " + e.getMessage()));
        }
    }
}