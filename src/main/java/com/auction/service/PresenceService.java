package com.auction.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class PresenceService {
    // Đếm số lượng người đang online trong phòng đấu giá
    private final ConcurrentHashMap<Long, AtomicInteger> roomCounts = new ConcurrentHashMap<>();

    public void userJoined(Long auctionId) {
        roomCounts.computeIfAbsent(auctionId, k -> new AtomicInteger(0)).incrementAndGet();
    }

    public void userLeft(Long auctionId) {
        roomCounts.computeIfAbsent(auctionId, k -> new AtomicInteger(0)).decrementAndGet();
    }

    public int getOnlineCount(Long auctionId) {
        return roomCounts.computeIfAbsent(auctionId, k -> new AtomicInteger(0)).get();
    }
}