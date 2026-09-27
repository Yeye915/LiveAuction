package com.auction.service;

import com.auction.dto.request.BidRequestDTO;
import com.auction.dto.response.BidResponseDTO;
import org.springframework.stereotype.Service;

@Service
public class BidService {

    // Logic xử lý khi có bid mới (có thể kết nối Database/Memory ở đây)
    public BidResponseDTO processBid(BidRequestDTO request) {
        // Ví dụ validate đơn giản cho demo giữa kỳ:
        // Kiểm tra số tiền có lớn hơn giá hiện tại không...

        BidResponseDTO response = new BidResponseDTO();
        response.setAuctionId(request.getAuctionId());
        response.setUserId(request.getUserId());
        response.setUserName(request.getUserName());
        response.setCurrentHighestBid(request.getAmount());
        response.setTimestamp(System.currentTimeMillis());
        response.setMessage(request.getUserName() + " vừa đặt mức giá: " + request.getAmount() + " VNĐ");

        return response;
    }
}