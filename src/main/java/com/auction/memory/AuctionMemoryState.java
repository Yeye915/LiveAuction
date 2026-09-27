package com.auction.memory;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuctionMemoryState {
    // Lưu trữ tạm thời giá cao nhất của từng phòng đấu giá để tối ưu tốc độ đọc/ghi real-time
    private final ConcurrentHashMap<Long, Double> highestBids = new ConcurrentHashMap<>();

    public Double getHighestBid(Long auctionId) {
        return highestBids.getOrDefault(auctionId, 0.0);
    }

    public void setHighestBid(Long auctionId, Double amount) {
        highestBids.put(auctionId, amount);
    }
}