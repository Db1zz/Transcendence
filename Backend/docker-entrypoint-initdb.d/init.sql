CREATE TABLE IF NOT EXISTS users (
     id UUID PRIMARY KEY,

     username VARCHAR NOT NULL,
     created_at TIMESTAMP NOT NULL,
     role VARCHAR(50) NOT NULL DEFAULT 'USER'
);

CREATE TABLE IF NOT EXISTS users_credentials (
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(1024),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CREATE TABLE IF NOT EXISTS user_sessions (
--     user_id UUID PRIMARY KEY,
--     id UUID NOT NULL,
--     token VARCHAR(255) NOT NULL,
--     device VARCHAR(255) NOT NULL,
--
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- )