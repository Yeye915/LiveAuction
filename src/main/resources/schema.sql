CREATE DATABASE IF NOT EXISTS live_auction_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE live_auction_db;

-- ----------------------------------------------------------------------------
-- BẢNG 1: users (Tài khoản người dùng)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
                                     user_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                                     username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role ENUM('CUSTOMER', 'AUCTIONEER') NOT NULL DEFAULT 'CUSTOMER',
    avatar VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- ----------------------------------------------------------------------------
-- BẢNG 2: products (Thông tin sản phẩm)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
                                        product_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                                        auctioneer_id INT NOT NULL,
                                        product_name VARCHAR(255) NOT NULL,
    description TEXT,
    material VARCHAR(100),
    dimensions VARCHAR(100),
    condition_pct INT NOT NULL DEFAULT 100,
    image_url VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auctioneer_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

-- ----------------------------------------------------------------------------
-- BẢNG 3: auctions (Phiên đấu giá trực tuyến)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auctions (
                                        auction_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                                        product_id INT NOT NULL,
                                        auctioneer_id INT NOT NULL,
                                        start_price DECIMAL(15,2) NOT NULL,
    price_step DECIMAL(15,2) NOT NULL,
    status ENUM('PENDING', 'LIVE', 'ENDED') NOT NULL DEFAULT 'PENDING',
    winning_bid DECIMAL(15,2),
    winner_id INT,
    started_at DATETIME,
    ended_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (auctioneer_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
    );

-- ----------------------------------------------------------------------------
-- BẢNG 4: bid_history (Lịch sử các lượt ra giá)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bid_history (
                                           bid_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                                           auction_id INT NOT NULL,
                                           user_id INT NOT NULL,
                                           bid_amount DECIMAL(15,2) NOT NULL,
    bid_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(auction_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

-- ----------------------------------------------------------------------------
-- BẢNG 5: messages (Lưu trữ tin nhắn chat công khai / riêng tư)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
                                        message_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                                        auction_id INT NOT NULL,
                                        sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_avatar VARCHAR(500),
    message_text TEXT NOT NULL,
    chat_type VARCHAR(50) DEFAULT 'public',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(auction_id) ON DELETE CASCADE
    );

-- ----------------------------------------------------------------------------
-- TẠO CHỈ MỤC (INDEX) TĂNG TỐC TRUY VẤN REAL-TIME
-- ----------------------------------------------------------------------------
CREATE INDEX idx_products_auctioneer ON products(auctioneer_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_bids_auction_time ON bid_history(auction_id, bid_time DESC);
CREATE INDEX idx_bids_time ON bid_history(bid_time);

-- ==========================================
-- DỮ LIỆU MẪU ĐỂ CHẠY THỬ PHÒNG #101
-- ==========================================
INSERT INTO users (user_id, username, password_hash, display_name, role, avatar) VALUES
                                                                                     (1, 'admin', '123456', 'Đấu giá viên', 'AUCTIONEER', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
                                                                                     (2, 'nhi', '123456', 'Nguyễn Trần Yến Nhi', 'CUSTOMER', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');

INSERT INTO products (product_id, auctioneer_id, product_name, description, material, dimensions, condition_pct, image_url) VALUES
    (1, 1, 'Đồng hồ Rolex cổ điển', 'Đồng hồ chính hãng phiên bản giới hạn, nguyên bản 99%.', 'Thép không gỉ / Vàng 18k', 'Size 40mm', 99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');

INSERT INTO auctions (auction_id, product_id, auctioneer_id, start_price, price_step, status) VALUES
    (101, 1, 1, 5000000.00, 100000.00, 'LIVE');