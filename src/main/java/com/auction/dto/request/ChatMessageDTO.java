package com.auction.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private Long auctionId;    // ID phòng đấu giá
    private String senderName; // Tên người gửi tin nhắn
    private String content;    // Nội dung tin nhắn
    private Long timestamp;    // Thời gian gửi
}