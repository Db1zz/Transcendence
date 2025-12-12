CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,

    username VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS users_credentials (
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    user_password VARCHAR(1024) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);