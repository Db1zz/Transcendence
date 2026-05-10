use async_trait::async_trait;
use uuid::Uuid;

use crate::{
    entity::{NotificationToSendKey, UserNotificationEntity},
    error::database::RepositoryError,
};

#[async_trait]
pub trait UserNotificationsRepository: Send + Sync {
    async fn post(&self, entity: &UserNotificationEntity) -> Result<(), RepositoryError>;
    async fn get(
        &self,
        key: &NotificationToSendKey,
    ) -> Result<UserNotificationEntity, RepositoryError>;
    async fn get_all(&self, user_id: Uuid) -> Result<Vec<UserNotificationEntity>, RepositoryError>;
    async fn remove(&self, key: NotificationToSendKey) -> Result<(), RepositoryError>;
    // async fn update_read(&self, key: NotificationToSendKey, is_read: bool) -> Result<(), RepositoryError>;
}
