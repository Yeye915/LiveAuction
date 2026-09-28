package com.auction.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chats")
@CrossOrigin(origins = "*")
public class ChatController {

    // Lưu trữ tin nhắn tạm thời trong RAM
    private static final List<Map<String, Object>> chatMessages = Collections.synchronizedList(new ArrayList<>());

    @GetMapping("/{auctionId}")
    public ResponseEntity<List<Map<String, Object>>> getMessages(
            @PathVariable Long auctionId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String targetId) {

        String targetType = (type != null) ? type : "public";

        List<Map<String, Object>> filteredMessages = chatMessages.stream()
                .filter(msg -> {
                    Object aucObj = msg.get("auctionId");
                    if (aucObj == null) return false;
                    boolean matchAuction = auctionId.toString().equals(aucObj.toString());
                    if (!matchAuction) return false;

                    String msgType = msg.get("type") != null ? msg.get("type").toString() : "public";

                    if ("public".equals(targetType)) {
                        return "public".equals(msgType);
                    } else {
                        // Lọc tin nhắn riêng tư (Private Chat)
                        if (!"private".equals(msgType)) return false;

                        String sId = msg.get("senderId") != null ? msg.get("senderId").toString() : "";
                        String rId = msg.get("recipientId") != null ? msg.get("recipientId").toString() : "";

                        String uId = userId != null ? userId : "";
                        String tId = targetId != null ? targetId : "";

                        // Xác định ID của khách hàng trong cuộc trò chuyện này
                        String customerId = "";
                        if (!uId.isEmpty() && !uId.equals("admin") && !uId.equals("auc_me") && !uId.equals("1")) {
                            customerId = uId;
                        } else if (!tId.isEmpty() && !tId.equals("admin") && !tId.equals("auc_me") && !tId.equals("1")) {
                            customerId = tId;
                        }
                        if (customerId.isEmpty()) {
                            customerId = !uId.isEmpty() ? uId : tId;
                        }

                        // Điều kiện: Tin nhắn phải có sự tham gia của khách hàng đó VÀ phía bên kia là Admin
                        boolean involvesCustomer = sId.equals(customerId) || rId.equals(customerId);
                        boolean involvesAdmin = sId.equals("admin") || rId.equals("admin") ||
                                sId.equals("auc_me") || rId.equals("auc_me") ||
                                sId.equals("1") || rId.equals("1");

                        return involvesCustomer && involvesAdmin;
                    }
                })
                .sorted(Comparator.comparing(m -> {
                    Object idObj = m.get("id");
                    return idObj != null ? Long.valueOf(idObj.toString()) : 0L;
                }))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredMessages);
    }

    @PostMapping
    public ResponseEntity<?> postMessage(@RequestBody Map<String, Object> message) {
        message.put("id", System.currentTimeMillis());
        if (!message.containsKey("type") || message.get("type") == null) {
            message.put("type", "public");
        }
        chatMessages.add(message);
        return ResponseEntity.ok(Map.of("success", true));
    }
}