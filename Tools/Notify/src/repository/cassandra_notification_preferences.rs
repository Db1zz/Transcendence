use async_trait::async_trait;
use scylla::client::session::Session;

use crate::{
    entity::{NotificationPreferencesEntity, NotificationPreferencesKey},
    error::database::{EntityNotFoundError, RepositoryError},
    repository::NotificationPreferencesRepository,
};

pub struct CassandraNotificationPreferencesRepository {
    session: Session,
}

impl CassandraNotificationPreferencesRepository {
    pub fn new(session: Session) -> Self {
        Self { session }
    }
}

#[async_trait]
impl NotificationPreferencesRepository for CassandraNotificationPreferencesRepository {
    async fn post(&self, entity: &NotificationPreferencesEntity) -> Result<(), RepositoryError> {
        let query = r#"
            INSERT INTO notify.notifications_preferences
            (user_id, target_type, target_id, mute_level)
            VALUES (?, ?, ?, ?)
        "#;

        self.session.query_unpaged(query, entity).await?;

        Ok(())
    }

    async fn get(
        &self,
        key: &NotificationPreferencesKey,
    ) -> Result<NotificationPreferencesEntity, RepositoryError> {
        let query = r#"
            SELECT user_id, target_type, target_id, mute_level
            FROM notify.notifications_preferences
            WHERE user_id = ? AND target_type = ? AND target_id = ?
        "#;

        let result = self
            .session
            .query_unpaged(
                query,
                (key.user_id, key.target_type.as_str(), key.target_id),
            )
            .await?;

        let entity = result
            .into_rows_result()?
            .rows()?
            .next()
            .transpose()?
            .ok_or(EntityNotFoundError {
                entity_id: key.target_id,
            })?;

        Ok(entity)
    }
}
