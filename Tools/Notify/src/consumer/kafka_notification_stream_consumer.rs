use std::str::Utf8Error;

use async_trait::async_trait;
use rdkafka::{consumer::StreamConsumer, error::KafkaError, message::BorrowedMessage, Message};
use tracing::{debug, instrument};
use uuid::Uuid;

use crate::consumer::NotificationStreamConsumer;
use crate::entity::UserNotificationEntity;
use crate::models::NotificationEvent;
use crate::utility::json::ExtractUuidError;

pub struct KafkaNotificationStreamConsumer {
    consumer: StreamConsumer,
}

impl KafkaNotificationStreamConsumer {
    pub fn new(consumer: StreamConsumer) -> Self {
        Self { consumer }
    }

    #[instrument(skip(self, raw_message))]
    fn parse_notification(
        &self,
        raw_message: &BorrowedMessage,
    ) -> Result<UserNotificationEntity, ParseError> {
        let message_str = raw_message
            .payload_view::<str>()
            .ok_or(ParseError::MissingPayload)?
            .map_err(ParseError::Utf8)?;

        debug!(payload = message_str, "Message");

        let event: NotificationEvent =
            serde_json::from_str(message_str).map_err(ParseError::InvalidJson)?;

        let user_id_str = event
            .payload
            .get("user_id")
            .and_then(|v| v.as_str())
            .ok_or(ParseError::MissingUserId)?;

        let user_id = Uuid::parse_str(user_id_str)?;

        Ok(UserNotificationEntity::new(
            user_id,
            event.etype.to_string(),
            event.scope.to_string(),
            event.payload.to_string(),
        ))
    }
}

#[async_trait]
impl NotificationStreamConsumer for KafkaNotificationStreamConsumer {
    type ConsumerError = NotificationRecvError;

    async fn recv(&self) -> Result<UserNotificationEntity, Self::ConsumerError> {
        let message = self.consumer.recv().await?;
        let notification = self.parse_notification(&message)?;
        Ok(notification)
    }
}

#[derive(thiserror::Error, Debug)]
pub enum ParseError {
    #[error(transparent)]
    InvalidUuidFormat(#[from] uuid::Error),

    #[error(transparent)]
    Utf8(#[from] Utf8Error),

    #[error(transparent)]
    InvalidJson(#[from] serde_json::error::Error),

    #[error(transparent)]
    ExtractUuid(#[from] ExtractUuidError),

    #[error("Missing payload in JSON Body")]
    MissingPayload,

    #[error("Missing user_id in JSON Body")]
    MissingUserId,
}

#[derive(thiserror::Error, Debug)]
pub enum NotificationRecvError {
    #[error(transparent)]
    Parse(#[from] ParseError),

    #[error(transparent)]
    Kafka(#[from] KafkaError),
}
