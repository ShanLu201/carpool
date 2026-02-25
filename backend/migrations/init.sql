-- 拼车网站数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS trip CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trip;

-- 1. 用户表 (users)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    real_name VARCHAR(50) COMMENT '真实姓名',
    id_card VARCHAR(20) COMMENT '身份证号',
    id_card_verified TINYINT DEFAULT 0 COMMENT '实名认证状态 0-未认证 1-已认证',
    gender TINYINT COMMENT '性别 0-未知 1-男 2-女',
    avatar_url VARCHAR(255) COMMENT '头像URL',
    rating DECIMAL(3,2) DEFAULT 5.00 COMMENT '评分',
    rating_count INT DEFAULT 0 COMMENT '评分人数',
    status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    INDEX idx_phone (phone),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 乘客需求表 (passenger_requests)
CREATE TABLE IF NOT EXISTS passenger_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '乘客用户ID',
    travel_date DATE NOT NULL COMMENT '出行日期',
    time_start TIME NOT NULL COMMENT '出发时间范围开始',
    time_end TIME NOT NULL COMMENT '出发时间范围结束',
    origin VARCHAR(255) NOT NULL COMMENT '出发地',
    origin_latitude DECIMAL(10,8) COMMENT '出发地纬度',
    origin_longitude DECIMAL(11,8) COMMENT '出发地经度',
    destination VARCHAR(255) NOT NULL COMMENT '目的地',
    destination_latitude DECIMAL(10,8) COMMENT '目的地纬度',
    destination_longitude DECIMAL(11,8) COMMENT '目的地经度',
    passenger_count INT NOT NULL COMMENT '乘车人数',
    price_min DECIMAL(10,2) COMMENT '期望价格最小值',
    price_max DECIMAL(10,2) COMMENT '期望价格最大值',
    remarks TEXT COMMENT '备注信息',
    status TINYINT DEFAULT 1 COMMENT '状态 0-已取消 1-进行中 2-已完成',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_date_status (travel_date, status),
    INDEX idx_origin (origin),
    INDEX idx_destination (destination),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='乘客需求表';

-- 3. 车主邀客表 (driver_invites)
CREATE TABLE IF NOT EXISTS driver_invites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '车主用户ID',
    travel_date DATE NOT NULL COMMENT '出行日期',
    time_start TIME NOT NULL COMMENT '出发时间范围开始',
    time_end TIME NOT NULL COMMENT '出发时间范围结束',
    origin VARCHAR(255) NOT NULL COMMENT '出发地',
    origin_latitude DECIMAL(10,8) COMMENT '出发地纬度',
    origin_longitude DECIMAL(11,8) COMMENT '出发地经度',
    destination VARCHAR(255) NOT NULL COMMENT '目的地',
    destination_latitude DECIMAL(10,8) COMMENT '目的地纬度',
    destination_longitude DECIMAL(11,8) COMMENT '目的地经度',
    available_seats INT NOT NULL COMMENT '可载人数',
    price DECIMAL(10,2) COMMENT '费用/人',
    car_model VARCHAR(100) COMMENT '车型',
    car_plate VARCHAR(20) COMMENT '车牌号',
    remarks TEXT COMMENT '备注信息',
    status TINYINT DEFAULT 1 COMMENT '状态 0-已取消 1-进行中 2-已完成',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_date_status (travel_date, status),
    INDEX idx_origin (origin),
    INDEX idx_destination (destination),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车主邀客表';

-- 4. 聊天消息表 (chat_messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NULL COMMENT '关联订单ID',
    from_user_id INT NOT NULL COMMENT '发送者ID',
    to_user_id INT NOT NULL COMMENT '接收者ID',
    message_type TINYINT DEFAULT 1 COMMENT '消息类型 1-文本 2-图片 3-语音',
    content TEXT NOT NULL COMMENT '消息内容',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order (order_id),
    INDEX idx_from_to (from_user_id, to_user_id),
    INDEX idx_created (created_at),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天消息表';

-- 5. 评价表 (reviews)
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL COMMENT '订单ID',
    from_user_id INT NOT NULL COMMENT '评价人ID',
    to_user_id INT NOT NULL COMMENT '被评价人ID',
    rating TINYINT NOT NULL COMMENT '评分 1-5',
    comment TEXT COMMENT '评价内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order (order_id),
    INDEX idx_to_user (to_user_id),
    UNIQUE KEY uk_order_from (order_id, from_user_id),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价表';
