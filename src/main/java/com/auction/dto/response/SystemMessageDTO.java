package com.auction.dto.response;

import lombok.Data;

@Data
public class SystemMessageDTO {
    private String type;    // Ví dụ: "NOTIFICATION", "WARNING"
    private String content; // Nội dung thông báo hệ thống
    private Long timestamp; // Thời gian phát thông báo
}