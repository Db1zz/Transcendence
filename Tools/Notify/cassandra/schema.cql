CREATE KEYSPACE IF NOT EXISTS notify
WITH replication = {'class':'SimpleStrategy','replication_factor':1};

CREATE TABLE IF NOT EXISTS notify.notifications_preferences (
    user_id uuid,
    target_type text, -- 'SERVER', 'CHANNEL', 'DM'
    target_id uuid,
    mute_level int,
    PRIMARY KEY (user_id, target_type, target_id)
) WITH CLUSTERING ORDER BY (target_type ASC, target_id ASC);

CREATE TABLE IF NOT EXISTS notify.user_notifications (
    user_id UUID,
    id UUID,
    etype TEXT,
    scope TEXT,
    payload TEXT,
    PRIMARY KEY (user_id, id)
);