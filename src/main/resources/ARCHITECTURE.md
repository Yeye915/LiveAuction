live-auction-backend/
│
├── src/main/java/com/auction/
│   ├── LiveAuctionApplication.java        -- Class chính khởi chạy Spring Boot
│   │
│   ├── config/                            -- CẤU HÌNH HỆ THỐNG
│   │   ├── SecurityConfig.java            -- Cấu hình Phân quyền / CORS / JWT
│   │   └── WebSocketConfig.java           -- Cấu hình WebSocket / STOMP Endpoint & Broker
│   │
│   ├── controller/                        -- HTTP REST API (Request - Response ngắn hạn)
│   │   ├── AuthController.java            -- API Đăng nhập, Đăng ký, Refresh Token
│   │   ├── ProductController.java         -- API Tạo, Sửa, Lấy danh sách sản phẩm
│   │   └── AuctionController.java         -- API Tạo phiên, Lấy danh sách phiên đấu giá
│   │
│   ├── socket/                            -- WEBSOCKET CONTROLLER (Giao tiếp Real-time 2 chiều)
│   │   ├── BidSocketController.java       -- Tiếp nhận lệnh Ra giá (Bid) qua Socket
│   │   ├── ChatSocketController.java      -- Tiếp nhận tin nhắn Chat qua Socket
│   │   └── event/                         -- Lắng nghe sự kiện kết nối Socket
│   │       └── WebSocketEventListener.java -- Bắt sự kiện User Join / Leave phòng
│   │
│   ├── model/                             -- ENTITY (Ánh xạ các Bảng MySQL qua JPA)
│   │   ├── User.java                      -- Bảng người dùng
│   │   ├── Product.java                   -- Bảng sản phẩm đấu giá
│   │   ├── Auction.java                   -- Bảng thông tin phiên đấu giá
│   │   └── Bid.java                       -- Bảng lịch sử ra giá
│   │
│   ├── repository/                        -- LỚP TRUY VẤN DATABASE (Spring Data JPA)
│   │   ├── UserRepository.java
│   │   ├── ProductRepository.java
│   │   ├── AuctionRepository.java
│   │   └── BidRepository.java
│   │
│   ├── service/                           -- LỚP XỬ LÝ NGHIỆP VỤ (BUSINESS LOGIC)
│   │   ├── AuthService.java
│   │   ├── ProductService.java
│   │   ├── AuctionService.java
│   │   ├── BidService.java
│   │   └── PresenceService.java           -- Quản lý danh sách & Số lượng User Online trên RAM
│   │
│   ├── dto/                               -- DATA TRANSFER OBJECT (Gói tin giao tiếp với FE)
│   │   ├── request/                       -- Gói tin FE gửi lên BE
│   │   │   ├── LoginRequest.java
│   │   │   ├── BidRequestDTO.java
│   │   │   └── ChatMessageDTO.java
│   │   └── response/                      -- Gói tin BE trả lại FE
│   │       ├── AuctionResponseDTO.java
│   │       ├── BidResponseDTO.java
│   │       └── SystemMessageDTO.java
│   │
│   ├── memory/                            -- QUẢN LÝ DỮ LIỆU TẠM TRÊN RAM
│   │   ├── AuctionMemoryState.java        -- Lưu Giá cao nhất & Người giữ giá hiện tại
│   │   └── ChatMemoryManager.java         -- Lưu 50 tin nhắn chat gần nhất của từng phiên
│   │
│   └── scheduler/                         -- CÔNG VIỆC CHẠY TỰ ĐỘNG
│       └── AuctionScheduler.java          -- Quét đếm ngược thời gian & Tự động chốt phiên
│
└── pom.xml                                -- Khai báo thư viện (Spring Web, WebSocket, JPA, MySQL, Lombok)