use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};
use typeshare::typeshare;

use uuid::Uuid;

use crate::entity::UserNotificationEntity;

#[derive(Debug, Clone, Copy, Deserialize, Serialize, Display, EnumString)]
pub enum EventType {
    #[serde(rename = "MESSAGE_CREATED")]
    MessageCreated,
}

#[derive(Debug, Clone, Copy, Deserialize, Serialize, Display, EnumString)]
pub enum EventScope {
    #[strum(serialize = "DM")]
    #[serde(rename = "DM")]
    DM,

    #[strum(serialize = "GroupChat")]
    #[serde(rename = "GROUP_CHAT")]
    GroupChat,

    #[strum(serialize = "ServerChat")]
    #[serde(rename = "SERVER_CHAT")]
    ServerChat,
}

#[typeshare]
#[derive(Clone, Deserialize, Serialize)]
pub struct Notification {
    pub id: Uuid,
    pub etype: EventType,
    pub scope: EventScope,
    pub payload: String,
}

impl Notification {
    pub fn new(id: Uuid, etype: EventType, scope: EventScope, payload: String) -> Self {
        Self {
            id,
            etype,
            scope,
            payload,
        }
    }
}

impl From<UserNotificationEntity> for Notification {
    fn from(entity: UserNotificationEntity) -> Self {
        Self {
            id: entity.id,
            etype: entity.etype.parse().unwrap_or(EventType::MessageCreated),
            scope: entity.scope.parse().unwrap_or(EventScope::DM),
            payload: entity.payload,
        }
    }
}
