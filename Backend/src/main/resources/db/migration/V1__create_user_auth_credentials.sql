CREATE TABLE IF NOT EXISTS user_auth_credentials (
    user_id BIGINT PRIMARY KEY,
    user_password VARCHAR(1024) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);