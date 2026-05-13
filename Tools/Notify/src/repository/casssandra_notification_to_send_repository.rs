use async_trait::async_trait;
use scylla::client::session::Session;
use uuid::Uuid;

use crate::{
    entity::{NotificationToSendKey, UserNotificationEntity},
    error::database::{EntityNotFoundError, RepositoryError},
    repository::UserNotificationsRepository,
};

pub struct CassandraUserNotificationsRepository {
    session: Session,
}

impl CassandraUserNotificationsRepository {
    pub fn new(session: Session) -> Self {
        Self { session }
    }
}

#[async_trait]
impl UserNotificationsRepository for CassandraUserNotificationsRepository {
    async fn post(&self, entity: &UserNotificationEntity) -> Result<(), RepositoryError> {
        let query = r#"
            INSERT INTO notify.user_notifications 
            (user_id, id, etype, scope, payload) 
            VALUES (?, ?, ?, ?, ?)
        "#;

        self.session.query_unpaged(query, entity).await?;

        Ok(())
    }

    async fn get(
        &self,
        key: &NotificationToSendKey,
    ) -> Result<UserNotificationEntity, RepositoryError> {
        let query = r#"
            SELECT user_id, id, etype, scope, payload
            FROM notify.user_notifications 
            WHERE user_id = ? AND id = ?
        "#;

        let result = self.session.query_unpaged(query, key).await?;

        let entity = result
            .into_rows_result()?
            .rows()?
            .next()
            .transpose()?
            .ok_or(EntityNotFoundError {
                entity_id: key.user_id,
            })?;

        Ok(entity)
    }

    async fn get_all(&self, user_id: Uuid) -> Result<Vec<UserNotificationEntity>, RepositoryError> {
        let query = r#"
            SELECT user_id, id, etype, scope, payload
            FROM notify.user_notifications 
            WHERE user_id = ?
        "#;

        let result = self.session.query_unpaged(query, (user_id,)).await?;

        let entities = result
            .into_rows_result()?
            .rows()?
            .collect::<Result<_, _>>()?;

        Ok(entities)
    }

    async fn remove(&self, key: NotificationToSendKey) -> Result<(), RepositoryError> {
        let query = r#"
            DELETE FROM notify.user_notifications
            WHERE user_id = ? AND id = ?
        "#;

        self.session.query_unpaged(query, key).await?;

        Ok(())
    }

    // async fn update_read(&self, key: NotificationToSendKey, is_read: bool) -> Result<(), RepositoryError> {
    //     let query = r#"
    //         UPDATE notify.user_notifications
    //         SET is_read = ?
    //         WHERE user_id = ? AND id = ?
    //     "#;

    //     let params = (
    //         is_read,
    //         key.user_id,
    //         key.notification_id
    //     );

    //     self.session
    //         .query_unpaged(query, params)
    //         .await?;

    //     Ok(())
    // }
}
