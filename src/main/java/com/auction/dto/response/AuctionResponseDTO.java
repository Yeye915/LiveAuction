package com.auction.dto.response;

import lombok.Data;

@Data
public class AuctionResponseDTO {
    private Long id;
    private String title;
    private Double startingPrice;
    private Double currentHighestBid;
    private String status;
}