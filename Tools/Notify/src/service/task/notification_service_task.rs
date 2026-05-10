use async_trait::async_trait;
use std::sync::Arc;
use std::time::Instant;

use crate::entity::UserNotificationEntity;
use crate::error::database::RepositoryError;
use crate::manager::task_manager::TaskManagerTask;
use crate::manager::ClientsManager;
use crate::metrics::LoadMetrics;
use crate::models::Notification;
use crate::repository::notification_to_send_repository::UserNotificationsRepository;
use crate::repository::CassandraUserNotificationsRepository;
use crate::service::{NotificationPreferencesService, NotificationPreferencesServiceError};
use tracing::{debug, error, info, instrument};

pub struct NotificationServiceTask {
    notification: UserNotificationEntity,
    user_notifications: Arc<CassandraUserNotificationsRepository>,
    notification_preferences: Arc<NotificationPreferencesService>,
    clients_manager: Arc<ClientsManager>,
    metrics: Arc<LoadMetrics>,
}

impl NotificationServiceTask {
    pub fn new(
        notification: UserNotificationEntity,
        user_notifications: Arc<CassandraUserNotificationsRepository>,
        notification_preferences: Arc<NotificationPreferencesService>,
        clients_manager: Arc<ClientsManager>,
        metrics: Arc<LoadMetrics>,
    ) -> Self {
        Self {
            notification,
            user_notifications,
            notification_preferences,
            clients_manager,
            metrics,
        }
    }

    #[instrument(skip(self, notification_entity))]
    async fn send_notification(&self, notification_entity: &UserNotificationEntity) -> bool {
        let notification = Notification::from(notification_entity.clone());
        let json = serde_json::to_string(&notification).unwrap();

        match self
            .clients_manager
            .send_to_client(notification_entity.user_id, json)
            .await
        {
            Ok(_) => {
                debug!("Notification sent successfully");
                return true;
            }
            Err(e) => {
                error!(error = ?e, user_id = ?notification_entity.user_id, "Failed to write to client" );
                return false;
            }
        }
    }
}

#[async_trait]
impl TaskManagerTask for NotificationServiceTask {
    #[instrument(skip(self))]
    async fn handle(&self) {
        let started_at = Instant::now();

        let is_muted = match self
            .notification_preferences
            .is_muted(&self.notification)
            .await
        {
            Ok(muted) => muted,
            Err(NotificationPreferencesServiceError::Repository(RepositoryError::NotFound(_))) => {
                false
            }
            Err(e) => {
                error!(error = ?e, msg = self.notification.payload, "Service error during is_muted() check");
                return;
            }
        };

        if is_muted {
            info!("Notification is blocked by user; skipping");
            return;
        }

        let _ = self.user_notifications.post(&self.notification).await;

        let is_sent = self.send_notification(&self.notification).await;
        if !is_sent {
            info!("Failed to send notification to a client, pushing to the database");
        }

        self.metrics.record_latency(started_at.elapsed());
        self.metrics.dec_queue();
    }
}
