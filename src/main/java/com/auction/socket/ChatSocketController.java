package com.auction.socket;

import com.auction.dto.request.ChatMessageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Nhận tin nhắn từ FE gửi đến: /app/auction/{auctionId}/chat
    @MessageMapping("/auction/{auctionId}/chat")
    public void handleChatMessage(@DestinationVariable Long auctionId, @Payload ChatMessageDTO message) {
        // Gán lại auctionId và thời gian nếu chưa có
        message.setAuctionId(auctionId);
        if (message.getTimestamp() == null) {
            message.setTimestamp(System.currentTimeMillis());
        }

        // Phát sóng tin nhắn tới tất cả client đang subscribe kênh: /topic/auction/{auctionId}/chat
        messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/chat", message);
    }
}