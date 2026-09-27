package com.auction.socket;

import com.auction.dto.request.SignalingMessageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SignalingSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Nhận gói tin tín hiệu WebRTC từ client gửi lên qua đường dẫn: /app/auction/{auctionId}/signal
     */
    @MessageMapping("/auction/{auctionId}/signal")
    public void handleSignaling(@DestinationVariable Long auctionId, @Payload SignalingMessageDTO message) {
        message.setAuctionId(auctionId);

        // Phát sóng (broadcast) gói tin tín hiệu đến tất cả client khác đang lắng nghe tại kênh:
        // /topic/auction/{auctionId}/signal
        // Các trình duyệt (Peer) sẽ tự nhận diện gói tin của nhau để thiết lập kết nối P2P (Livestream / DataChannel)
        messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/signal", message);
    }
}