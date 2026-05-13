use rdkafka::message::ToBytes;
use tokio::{io::AsyncWriteExt, net::TcpStream};

use crate::metrics::{Message, Register};

pub struct MetricsSender {
    stream: Option<TcpStream>,
    receiver_addr: String,
}

impl MetricsSender {
    pub fn new(receiver_addr: String) -> Self {
        Self {
            stream: None,
            receiver_addr,
        }
    }

    pub async fn send(&mut self, msg: Message) -> Result<(), MetricsSenderError> {
        let stream = self
            .stream
            .as_mut()
            .ok_or(MetricsSenderError::NotConnected)?;

        let json_msg = serde_json::to_string(&msg)? + "\n";

        stream
            .write_all(json_msg.to_bytes())
            .await
            .map_err(MetricsSenderError::Io)?;

        Ok(())
    }

    pub async fn register(&mut self, register: Register) -> Result<(), MetricsSenderError> {
        if self.stream.is_some() {
            return Err(MetricsSenderError::Connected);
        }

        let stream = TcpStream::connect(&self.receiver_addr).await?;

        self.stream = Some(stream);

        self.send(Message::Register(register)).await?;

        Ok(())
    }
}

#[derive(thiserror::Error, Debug)]
pub enum MetricsSenderError {
    #[error("not connected")]
    NotConnected,

    #[error("is already connected")]
    Connected,

    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    Serialize(#[from] serde_json::Error),
}
