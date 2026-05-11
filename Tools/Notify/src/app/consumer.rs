use std::sync::Arc;

use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::ClientConfig;
use scylla::client::session_builder::SessionBuilder;
use tracing::{info, instrument};

use crate::api::router::NotificationRouter;
use crate::api::ApiRunner;
use crate::config::ConsumerConfig;
use crate::consumer::KafkaNotificationStreamConsumer;
use crate::manager::task_manager::TaskManager;
use crate::manager::ClientsManager;
use crate::repository::{
    CassandraNotificationPreferencesRepository, CassandraUserNotificationsRepository,
};
use crate::service::{NotificationPreferencesService, NotificationService};

#[instrument(skip(config))]
pub async fn start(config: ConsumerConfig, jwt_secret: String) {
    let mut client_config: ClientConfig = ClientConfig::new();

    client_config
        .set("bootstrap.servers", config.brokers)
        .set("session.timeout.ms", "6000")
        .set("group.id", "anteiku-consumer-group")
        .set("auto.offset.reset", "earliest");

    let consumer: StreamConsumer = client_config.create().expect("Consumer creation failed");

    consumer
        .subscribe(&[&config.topic])
        .expect("Can't subscribe to specified topics");

    consumer
        .fetch_metadata(Some(&config.topic), std::time::Duration::from_secs(3))
        .expect("failed to fetch kafka metadata");

    let user_notifications_session = SessionBuilder::new()
        .known_node(config.user_notifications_database_addr)
        .build()
        .await
        .unwrap();

    let user_notifications = Arc::new(CassandraUserNotificationsRepository::new(
        user_notifications_session,
    ));

    let notification_preferences_session = SessionBuilder::new()
        .known_node(config.notification_preferences_database_addr)
        .build()
        .await
        .unwrap();

    let notification_preferences = Arc::new(CassandraNotificationPreferencesRepository::new(
        notification_preferences_session,
    ));

    let notification_preferences_service = Arc::new(NotificationPreferencesService::new(
        notification_preferences,
    ));

    let kafka_stream_consumer = Arc::new(KafkaNotificationStreamConsumer::new(consumer));

    let api_runner = ApiRunner::new(
        "127.0.0.1:9921".to_owned(),
        NotificationRouter::new(user_notifications.clone()),
    );

    api_runner.run();

    let clients_manager = Arc::new(ClientsManager::new(config.clients_node_addr, jwt_secret).await);

    let task_manager = TaskManager::new(4);

    let mut notification_service = NotificationService::new(
        user_notifications,
        notification_preferences_service,
        kafka_stream_consumer,
        clients_manager,
        task_manager,
        config.metrics_receiver_addr,
    );

    info!("Service is successfully started!");

    notification_service.start().await;

    tokio::signal::ctrl_c()
        .await
        .expect("Failed to listen ctrl + c");
    info!("Shutdown signal received, waiting for workers to exit");
}
