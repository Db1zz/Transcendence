CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    image_url VARCHAR(255),
    -- not null bcs oauth google and github users don't have password :O
    password VARCHAR(255),
    provider VARCHAR(255) NOT NULL DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_auth_credentials (
    user_id BIGINT PRIMARY KEY,
    user_password VARCHAR(1024) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);