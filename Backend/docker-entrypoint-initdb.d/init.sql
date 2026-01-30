CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    display_name VARCHAR NOT NULL,
    username VARCHAR NOT NULL UNIQUE,
    status VARCHAR,
    about VARCHAR,
    picture VARCHAR DEFAULT("https://i.pinimg.com/736x/eb/e8/af/ebe8afd49d1a125b0950dec5d20bb98b.jpg"),
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
    UNIQUE (requester_id, addresse_id),
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (addresse_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CREATE TABLE IF NOT EXISTS user_sessions (
--     user_id UUID PRIMARY KEY,
--     id UUID NOT NULL,
--     token VARCHAR(255) NOT NULL,
--     device VARCHAR(255) NOT NULL,
--
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- )