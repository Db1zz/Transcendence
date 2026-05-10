use async_trait::async_trait;

use crate::entity::UserNotificationEntity;

#[async_trait]
pub trait NotificationStreamConsumer: Sync + Send {
    type ConsumerError: std::error::Error + Send + Sync + 'static;

    async fn recv(&self) -> Result<UserNotificationEntity, Self::ConsumerError>;
}
