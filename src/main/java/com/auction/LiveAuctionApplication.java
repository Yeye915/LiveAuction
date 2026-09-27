package com.auction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // Bật tính năng chạy lịch trình tự động (cho AuctionScheduler)
public class LiveAuctionApplication {

    public static void main(String[] args) {
        SpringApplication.run(LiveAuctionApplication.class, args);
    }
}