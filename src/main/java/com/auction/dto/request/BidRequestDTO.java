package com.auction.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BidRequestDTO {
    private Long auctionId; // ID phòng đấu giá
    private Long userId;    // ID người ra giá
    private String userName;// Tên người ra giá
    private Double amount;  // Số tiền đặt giá
}