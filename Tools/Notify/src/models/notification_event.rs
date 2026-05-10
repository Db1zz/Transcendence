use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::models::notification::{EventScope, EventType};

#[derive(Serialize, Deserialize)]
pub struct NotificationEvent {
    #[serde(rename = "type")]
    pub etype: EventType,
    pub scope: EventScope,
    pub payload: Value,
}

impl NotificationEvent {
    pub fn new(etype: EventType, scope: EventScope, payload: Value) -> Self {
        Self {
            etype,
            scope,
            payload,
        }
    }
}
