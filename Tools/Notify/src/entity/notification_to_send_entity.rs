use scylla::{DeserializeRow, SerializeRow};
use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Clone, SerializeRow, DeserializeRow, Serialize)]
pub struct UserNotificationEntity {
    pub user_id: Uuid,
    pub id: Uuid,
    pub etype: String,
    pub scope: String,
    pub payload: String,
}

impl UserNotificationEntity {
    pub fn new(user_id: Uuid, etype: String, scope: String, payload: String) -> Self {
        Self {
            user_id,
            id: Uuid::new_v4(),
            etype,
            scope,
            payload,
        }
    }
}

#[derive(Debug, Clone, SerializeRow, DeserializeRow)]
pub struct NotificationToSendKey {
    pub user_id: Uuid,
    pub id: Uuid,
}

impl NotificationToSendKey {
    pub fn new(user_id: Uuid, id: Uuid) -> Self {
        Self { user_id, id }
    }
}
