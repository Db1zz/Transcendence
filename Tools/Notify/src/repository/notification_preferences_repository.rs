use async_trait::async_trait;

use crate::{
    entity::{NotificationPreferencesEntity, NotificationPreferencesKey},
    error::database::RepositoryError,
};

#[async_trait]
pub trait NotificationPreferencesRepository: Send + Sync {
    async fn post(&self, entity: &NotificationPreferencesEntity) -> Result<(), RepositoryError>;
    async fn get(
        &self,
        key: &NotificationPreferencesKey,
    ) -> Result<NotificationPreferencesEntity, RepositoryError>;
}
