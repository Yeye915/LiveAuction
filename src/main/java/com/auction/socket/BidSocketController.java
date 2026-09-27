package com.auction.socket;

import com.auction.dto.request.BidRequestDTO;
import com.auction.dto.response.BidResponseDTO;
import com.auction.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class BidSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private BidService bidService;

    // Nhận request đặt giá từ FE tại: /app/auction/{auctionId}/bid
    @MessageMapping("/auction/{auctionId}/bid")
    public void handleBid(@DestinationVariable Long auctionId, @Payload BidRequestDTO request) {
        request.setAuctionId(auctionId);

        // Gọi Service xử lý logic đặt giá
        BidResponseDTO response = bidService.processBid(request);

        // Broadcast kết quả cập nhật giá mới tới tất cả client đang subscribe: /topic/auction/{auctionId}/bids
        messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/bids", response);
    }
}