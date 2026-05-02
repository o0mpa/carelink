-- Run once against your CareLink MySQL database (e.g. mysql ... < migrations/001_chat_messages.sql)
CREATE TABLE IF NOT EXISTS chat_messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  sender_user_id INT NOT NULL,
  receiver_user_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chat_request_created (request_id, created_at),
  CONSTRAINT fk_chat_messages_request
    FOREIGN KEY (request_id) REFERENCES care_requests (request_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
