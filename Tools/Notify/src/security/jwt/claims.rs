use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Claims {
    pub sub: String,
    pub user_id: Uuid,
    pub exp: usize,
}

impl Claims {
    pub fn new(sub: String, user_id: Uuid, exp: usize) -> Self {
        Self { sub, user_id, exp }
    }
}
