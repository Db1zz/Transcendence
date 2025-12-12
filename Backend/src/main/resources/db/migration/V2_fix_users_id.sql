-- file: src/main/resources/db/migration/V2_fix_users_id.sql
CREATE SEQUENCE IF NOT EXISTS users_id_seq OWNED BY users.id;

SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));

ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);
