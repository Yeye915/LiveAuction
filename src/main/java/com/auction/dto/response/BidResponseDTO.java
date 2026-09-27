package com.auction.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BidResponseDTO {
    private Long auctionId;
    private Long userId;
    private String userName;
    private Double currentHighestBid; // Giá cao nhất hiện tại của phòng
    private Long timestamp;
    private String message;           // Thông báo trạng thái (VD: "User X vừa đặt 500k")
}