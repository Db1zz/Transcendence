use std::sync::Arc;
use uuid::Uuid;

use crate::{
    entity::{NotificationPreferencesEntity, NotificationPreferencesKey, UserNotificationEntity},
    error::{common::UnimplementedFeature, database::RepositoryError},
    models::notification::EventScope,
    repository::{CassandraNotificationPreferencesRepository, NotificationPreferencesRepository},
    utility::json::{extract_uuid, ExtractUuidError},
};

pub struct NotificationPreferencesService {
    repository: Arc<CassandraNotificationPreferencesRepository>,
}

impl NotificationPreferencesService {
    pub fn new(repository: Arc<CassandraNotificationPreferencesRepository>) -> Self {
        Self { repository }
    }

    pub async fn get_preferences(
        &self,
        user_id: Uuid,
        target_type: &String,
        target_id: Uuid,
    ) -> Result<NotificationPreferencesEntity, RepositoryError> {
        let key = NotificationPreferencesKey::new(user_id, target_type.to_owned(), target_id);

        self.repository.get(&key).await
    }

    async fn get_target_mute_state(
        &self,
        user_id: Uuid,
        target_type: &str,
        target_id: Uuid,
    ) -> Result<bool, NotificationPreferencesServiceError> {
        let key = NotificationPreferencesKey::new(user_id, target_type.to_owned(), target_id);
        match self.repository.get(&key).await {
            Ok(_) => Ok(true),
            Err(RepositoryError::NotFound(_)) => Ok(false),
            Err(e) => Err(e.into()),
        }
    }

    pub async fn is_muted(
        &self,
        notification: &UserNotificationEntity,
    ) -> Result<bool, NotificationPreferencesServiceError> {
        let scope: EventScope = notification.scope.parse()?;
        match scope {
            EventScope::DM => {
                let target_id = extract_uuid(&notification.payload, "sender_id")?;
                let user_id = extract_uuid(&notification.payload, "user_id")?;
                self.get_target_mute_state(user_id, "DM", target_id).await
            }
            EventScope::GroupChat => Err(UnimplementedFeature::new("GroupChat logic").into()),
            EventScope::ServerChat => Err(UnimplementedFeature::new("ServerChat logic").into()),
        }
    }

    pub async fn mute(
        &self,
        preferences: &NotificationPreferencesEntity,
    ) -> Result<(), NotificationPreferencesServiceError> {
        self.repository.post(preferences).await?;
        Ok(())
    }
}

#[derive(thiserror::Error, Debug)]
pub enum NotificationPreferencesServiceError {
    #[error(transparent)]
    Repository(#[from] RepositoryError),

    #[error(transparent)]
    InvalidScope(#[from] strum::ParseError),

    #[error(transparent)]
    InvalidUUID(#[from] uuid::Error),

    #[error(transparent)]
    ExtractUuid(#[from] ExtractUuidError),

    #[error("Invalid message syntax")]
    InvalidMessageSyntax,

    #[error("Unknown notification scope")]
    UnknownNotificationScope,

    #[error("Json key not found")]
    JsonKeyNotFound,

    // Note: !!! Temporary error !!!
    #[error(transparent)]
    UnimplementedFeature(#[from] UnimplementedFeature),
}
