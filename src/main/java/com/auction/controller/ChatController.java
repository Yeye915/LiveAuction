package com.auction.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chats")
@CrossOrigin(origins = "*")
public class ChatController {

    private final List<Map<String, Object>> chatMessages = Collections.synchronizedList(new ArrayList<>());

    @GetMapping("/{auctionId}")
    public ResponseEntity<List<Map<String, Object>>> getMessages(
            @PathVariable Long auctionId,
            @RequestParam(required = false) String type) {

        // Lọc tin nhắn theo auctionId và type (mặc định trả về public nếu không truyền type)
        String targetType = (type != null) ? type : "public";

        List<Map<String, Object>> filteredMessages = chatMessages.stream()
                .filter(msg -> {
                    boolean matchAuction = auctionId.equals(Long.valueOf(msg.get("auctionId").toString()));
                    String msgType = msg.get("type") != null ? msg.get("type").toString() : "public";
                    return matchAuction && msgType.equals(targetType);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredMessages);
    }

    @PostMapping
    public ResponseEntity<?> postMessage(@RequestBody Map<String, Object> message) {
        message.put("id", System.currentTimeMillis());
        // Đảm bảo tin nhắn có trường type (public hoặc private)
        if (!message.containsKey("type") || message.get("type") == null) {
            message.put("type", "public");
        }
        chatMessages.add(message);
        return ResponseEntity.ok(Map.of("success", true));
    }
}