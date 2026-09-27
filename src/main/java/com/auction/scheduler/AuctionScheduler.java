package com.auction.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AuctionScheduler {

    // Tự động kiểm tra trạng thái các phiên đấu giá mỗi phút (phục vụ demo / tự động đóng mở phòng)
    @Scheduled(fixedRate = 60000)
    public void checkAuctionStatus() {
        // Viết logic cập nhật trạng thái đấu giá tự động ở đây nếu cần
    }
}