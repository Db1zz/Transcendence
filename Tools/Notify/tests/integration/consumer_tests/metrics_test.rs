use std::{sync::Arc, time::Duration};

use notify::{app, config::ConsumerConfig, metrics::metrics_receiver::MetricsReceiver};
use serial_test::serial;
use tokio::time;

use crate::utils::{get_jwt_secret, start_docker_compose};

#[tokio::test]
#[serial]
async fn test_metrics_sender_reconnection() {
    start_docker_compose().await;

    let receiver_addr = "0.0.0.0:1234".to_owned();

    let receiver = Arc::new(MetricsReceiver::new(receiver_addr.clone()).await);
    let mut receiver_clone = receiver.clone();
    let handle = tokio::spawn(async move {
        receiver_clone.start().await;
    });

    let config = ConsumerConfig {
        topic: "user-notifs".to_owned(),
        brokers: "localhost:9092".to_owned(),
        user_notifications_database_addr: "127.0.0.1:9042".to_owned(),
        notification_preferences_database_addr: "127.0.0.1:9042".to_owned(),
        clients_node_addr: "127.0.0.1:6969".to_owned(),
        metrics_receiver_addr: receiver_addr.clone(),
    };

    tokio::spawn(async move {
        app::consumer::start(config, get_jwt_secret()).await;
    });

    time::sleep(Duration::from_secs(5)).await;
    let node: String = receiver.get_least_loaded_consumer_node().await.unwrap();
    assert!(!node.is_empty());

    time::sleep(Duration::from_secs(6)).await;
    handle.abort();

    receiver_clone = receiver.clone();
    tokio::spawn(async move {
        receiver_clone.start().await;
    });

    time::sleep(Duration::from_secs(5)).await;
    let node = receiver.get_least_loaded_consumer_node().await.unwrap();
    assert!(!node.is_empty());
}
