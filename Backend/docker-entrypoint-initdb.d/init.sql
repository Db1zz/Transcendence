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

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token BYTEA NOT NULL,

    device_id UUID NOT NULL, -- Suka how to get this one i don't blyat know?>?>?>>?>?>

    created_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ DEFAULT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMPTZ DEFAULT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)