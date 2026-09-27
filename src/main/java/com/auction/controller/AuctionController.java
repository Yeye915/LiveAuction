package com.auction.controller;

import com.auction.model.Auction;
import com.auction.repository.AuctionRepository;
import com.auction.repository.BidHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auctions")
@CrossOrigin(origins = "*")
public class AuctionController {

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private BidHistoryRepository bidHistoryRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getAuctionDetail(@PathVariable Long id) {
        Optional<Auction> auctionOpt = auctionRepository.findById(id);
        if (auctionOpt.isPresent()) {
            Auction auction = auctionOpt.get();

            // Tìm lượt ra giá cao nhất hiện tại trong bảng bid_history
            Double highestBid = bidHistoryRepository.findHighestBidByAuctionId(id);
            String highestBidder = bidHistoryRepository.findHighestBidderByAuctionId(id);

            if (highestBid == null) {
                highestBid = auction.getStartPrice();
                highestBidder = "Chưa có";
            }

            // Đóng gói dữ liệu trả về khớp hoàn toàn với cấu trúc JSON mà JS đang mong đợi
            Map<String, Object> response = new HashMap<>();
            response.put("id", auction.getAuctionId());
            response.put("startingPrice", auction.getStartPrice());
            response.put("currentHighestBid", highestBid);
            response.put("currentHighestBidder", highestBidder);
            response.put("status", auction.getStatus().name());

            // Thông tin sản phẩm đi kèm
            if (auction.getProduct() != null) {
                Map<String, Object> prod = new HashMap<>();
                prod.put("name", auction.getProduct().getProductName());
                prod.put("description", auction.getProduct().getDescription());
                response.put("product", prod);
            }

            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }
}