CREATE DATABASE live_auction_db;
USE live_auction_db;

-- ----------------------------------------------------------------------------
-- BẢNG 1: users (Tài khoản người dùng)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
                       user_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL, -- ID tài khoản người dùng
                       username VARCHAR(50) NOT NULL UNIQUE,            -- Tên đăng nhập
                       password_hash VARCHAR(255) NOT NULL,             -- Mật khẩu đã mã hóa
                       display_name VARCHAR(100) NOT NULL,              -- Tên hiển thị công khai
                       role ENUM('CUSTOMER', 'AUCTIONEER') NOT NULL DEFAULT 'CUSTOMER', -- Quyền: CUSTOMER hoặc AUCTIONEER
                       created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,         -- Thời gian tạo tài khoản
                       updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Thời gian cập nhật
);

-- ----------------------------------------------------------------------------
-- BẢNG 2: products (Thông tin sản phẩm)
-- ----------------------------------------------------------------------------
CREATE TABLE products (
                          product_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL, -- ID sản phẩm
                          auctioneer_id INT NOT NULL,                         -- ID Đấu giá viên tạo sản phẩm
                          product_name VARCHAR(255) NOT NULL,                 -- Tên sản phẩm
                          description TEXT,                                   -- Mô tả chi tiết sản phẩm
                          material VARCHAR(100),                              -- Chất liệu (VD: Vàng, Gỗ, Thép)
                          dimensions VARCHAR(100),                            -- Kích thước (VD: 30cm x 20cm x 25cm)
                          condition_pct INT NOT NULL DEFAULT 100,             -- Tình trạng độ mới (%)
                          image_url VARCHAR(500),                             -- Đường dẫn hình ảnh sản phẩm
                          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo sản phẩm

                          FOREIGN KEY (auctioneer_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- BẢNG 3: auctions (Phiên đấu giá trực tuyến)
-- ----------------------------------------------------------------------------
CREATE TABLE auctions (
                          auction_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL, -- ID phiên đấu giá
                          product_id INT NOT NULL,                            -- ID sản phẩm đưa vào đấu giá
                          auctioneer_id INT NOT NULL,                         -- ID Đấu giá viên chủ trì phiên
                          start_price DECIMAL(15,2) NOT NULL,                 -- Giá khởi điểm ban đầu (VNĐ)
                          price_step DECIMAL(15,2) NOT NULL,                  -- Bước giá tối thiểu (VNĐ)
                          status ENUM('PENDING', 'LIVE', 'ENDED') NOT NULL DEFAULT 'PENDING', -- Trạng thái phiên live
                          winning_bid DECIMAL(15,2),                          -- Giá chốt phiên cuối cùng (VNĐ)
                          winner_id INT,                                      -- ID Khách hàng chốt thắng
                          started_at DATETIME,                                -- Thời điểm bấm mở phiên live
                          ended_at DATETIME,                                  -- Thời điểm gõ búa chốt phiên
                          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo phiên

                          FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE,
                          FOREIGN KEY (auctioneer_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
                          FOREIGN KEY (winner_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- BẢNG 4: bid_history (Lịch sử các lượt ra giá)
-- (Code backend sẽ chạy lệnh DELETE dọn dẹp dữ liệu cột bid_time quá 30 ngày)
-- ----------------------------------------------------------------------------
CREATE TABLE bid_history (
                             bid_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL, -- ID lượt ra giá
                             auction_id INT NOT NULL,                        -- ID phiên đấu giá tương ứng
                             user_id INT NOT NULL,                           -- ID Khách hàng thực hiện ra giá
                             bid_amount DECIMAL(15,2) NOT NULL,              -- Số tiền khách hàng đặt giá (VNĐ)
                             bid_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Thời điểm ghi nhận lượt ra giá

                             FOREIGN KEY (auction_id) REFERENCES auctions(auction_id) ON DELETE CASCADE ON UPDATE CASCADE,
                             FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- TẠO CHỈ MỤC (INDEX) TĂNG TỐC TRUY VẤN REAL-TIME
-- ----------------------------------------------------------------------------
CREATE INDEX idx_products_auctioneer ON products(auctioneer_id); -- Tìm sản phẩm theo Đấu giá viên
CREATE INDEX idx_auctions_status ON auctions(status);            -- Lọc nhanh các phiên đang LIVE
CREATE INDEX idx_bids_auction_time ON bid_history(auction_id, bid_time DESC); -- Lấy danh sách ra giá mới nhất
CREATE INDEX idx_bids_time ON bid_history(bid_time);              -- Tối ưu cho backend quét xóa data > 30 ngày