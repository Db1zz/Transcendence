use scylla::{DeserializeRow, SerializeRow};
use uuid::Uuid;

#[derive(Debug, Clone, SerializeRow, DeserializeRow)]
pub struct NotificationPreferencesEntity {
    pub user_id: Uuid,
    pub target_type: String,
    pub target_id: Uuid,
    pub mute_level: i32,
}

impl NotificationPreferencesEntity {
    pub fn new(user_id: Uuid, target_type: String, target_id: Uuid, mute_level: i32) -> Self {
        Self {
            user_id,
            target_type,
            target_id,
            mute_level,
        }
    }
}

#[derive(Debug, Clone, SerializeRow, DeserializeRow)]
pub struct NotificationPreferencesKey {
    pub user_id: Uuid,
    pub target_type: String,
    pub target_id: Uuid,
}

impl NotificationPreferencesKey {
    pub fn new(user_id: Uuid, target_type: String, target_id: Uuid) -> Self {
        Self {
            user_id,
            target_type,
            target_id,
        }
    }
}
