package com.auction.memory;

import com.auction.dto.request.ChatMessageDTO;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatMemoryManager {
    // Lưu lịch sử chat tạm thời theo từng phòng đấu giá
    private final ConcurrentHashMap<Long, List<ChatMessageDTO>> chatHistories = new ConcurrentHashMap<>();

    public void addMessage(Long auctionId, ChatMessageDTO message) {
        chatHistories.computeIfAbsent(auctionId, k -> new ArrayList<>()).add(message);
    }

    public List<ChatMessageDTO> getMessages(Long auctionId) {
        return chatHistories.getOrDefault(auctionId, new ArrayList<>());
    }
}