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
    refresh_token BYTEA PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL,

    user_id UUID NOT NULL,

    public_key BYTEA DEFAULT NULL, -- idk, shall i keep it?

    device_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMPTZ DEFAULT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)