use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type", content = "data")]
pub enum Message {
    Register(Register),
    Metrics(Metrics),
    ConnectionLost(ConnectionLost),
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum NodeRole {
    NotificationService,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Metrics {
    pub public_addr: String,
    pub load: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Register {
    pub public_addr: String,
    pub role: NodeRole,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConnectionLost {
    pub public_addr: String,
}
