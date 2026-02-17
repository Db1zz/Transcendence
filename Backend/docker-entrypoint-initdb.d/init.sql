CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    display_name VARCHAR NOT NULL,
    username VARCHAR NOT NULL UNIQUE,
    status VARCHAR,
    about VARCHAR,
    picture VARCHAR DEFAULT 'https://i.pinimg.com/736x/eb/e8/af/ebe8afd49d1a125b0950dec5d20bb98b.jpg',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    role VARCHAR(50) NOT NULL DEFAULT 'USER'
);

CREATE TABLE IF NOT EXISTS users_credentials (
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(1024),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL,
    addressee_id UUID NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (requester_id, addressee_id),
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY,
    refresh_token BYTEA NOT NULL,
    refresh_token_expires_at TIMESTAMPTZ NOT NULL,
    access_token BYTEA NOT NULL,
    access_token_expires_at TIMESTAMPTZ NOT NULL,

    user_id UUID NOT NULL,

    -- public_key BYTEA DEFAULT NULL, -- idk, shall i keep it?

    -- device_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMPTZ DEFAULT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)