package com.auction.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignalingMessageDTO {
    private String type;       // Loại tín hiệu: "join", "offer", "answer", "candidate", "leave"
    private Long auctionId;    // ID phòng đấu giá
    private String senderId;   // Định danh người gửi (userId hoặc username)
    private String targetId;   // Định danh người nhận (dùng cho chat P2P 1-1 nếu cần, hoặc broadcast)
    private Object payload;    // Nội dung chứa SDP (Session Description) hoặc ICE Candidate
}