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

);

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    name VARCHAR NOT NULL,

    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member_roles (
    member_id UUID NOT NULL,
    role_id UUID NOT NULL,

    PRIMARY KEY (member_id, role_id),

    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES  roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    type VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS channel_overrides (
    channel_id UUID NOT NULL,
    entity_type VARCHAR NOT NULL,
    entity_id UUID NOT NULL,

    PRIMARY KEY (channel_id, entity_id),
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
);