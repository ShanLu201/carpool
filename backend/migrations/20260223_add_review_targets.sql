ALTER TABLE reviews
  MODIFY COLUMN order_id INT NULL COMMENT '订单ID',
  ADD COLUMN target_type ENUM('passenger', 'driver') NULL COMMENT '评价目标类型' AFTER order_id,
  ADD COLUMN target_id INT NULL COMMENT '评价目标ID' AFTER target_type;

ALTER TABLE reviews
  ADD INDEX idx_target (target_type, target_id),
  ADD UNIQUE KEY uk_from_target (from_user_id, target_type, target_id);
