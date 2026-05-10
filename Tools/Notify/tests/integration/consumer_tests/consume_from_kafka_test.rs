use futures::{SinkExt, StreamExt};
use notify::{
    app,
    config::ConsumerConfig,
    entity::NotificationPreferencesEntity,
    models::{
        notification::{EventScope, EventType},
        NotificationEvent,
    },
    repository::CassandraNotificationPreferencesRepository,
    service::NotificationPreferencesService,
};
use rdkafka::{
    producer::{FutureProducer, FutureRecord},
    ClientConfig,
};
use scylla::client::session_builder::SessionBuilder;
use serde_json::Value;
use serial_test::serial;
use std::{str::FromStr, sync::Arc, time::Duration};
use tokio::time::{sleep, timeout};
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};
use uuid::Uuid;

use crate::utils::{generate_token_for_test, get_jwt_secret, start_docker_compose};

async fn produce_stream_data(
    brokers: String,
    topic: String,
    client_ids: &Vec<Uuid>,
    sender_id: Uuid,
) {
    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", brokers)
        .set("message.timeout.ms", "5000")
        .create()
        .expect("Producer creation error");

    for id in client_ids {
        let payload = format!(r#"{{"user_id": "{}", "sender_id": "{}"}}"#, id, sender_id);

        let stream_data = NotificationEvent {
            etype: EventType::MessageCreated,
            scope: EventScope::DM,
            payload: Value::from_str(&payload).unwrap(),
        };

        let json_payload = serde_json::to_string(&stream_data).unwrap();
        let _ = producer
            .send(
                FutureRecord::to(&topic)
                    .payload(json_payload.as_bytes())
                    .key(&id.to_string()),
                Duration::from_secs(5),
            )
            .await;
    }
}

async fn run_client(consumer_addr: String, client_id: Uuid) {
    let ws_addr = format!("ws://{}", consumer_addr);
    let (mut ws_stream, _) = connect_async(&ws_addr).await.expect("Failed to connect");

    let token = generate_token_for_test(client_id, &get_jwt_secret());
    ws_stream
        .send(Message::Text(token.into()))
        .await
        .expect("Failed to send token");

    println!(
        "Client {}: Authenticated, waiting for notification...",
        client_id
    );
    let msg_result = timeout(Duration::from_secs(15), ws_stream.next()).await;

    match msg_result {
        Ok(Some(Ok(msg))) => {
            if msg.is_text() || msg.is_binary() {
                println!("Client {}: Received: {}", client_id, msg);
            } else {
                panic!("Client {}: Received unexpected message type", client_id);
            }
        }
        _ => panic!(
            "Client {}: Failed to receive notification (timeout or error)",
            client_id
        ),
    }
}

#[tokio::test]
#[serial]
pub async fn test_consumer_notification_delivery_to_a_single_client() {
    start_docker_compose().await;

    let consumer_addr = "127.0.0.1:7979".to_owned();
    let brokers = "localhost:9092".to_owned();
    let topic = "user-notifs".to_owned();

    let config = ConsumerConfig {
        topic: topic.clone(),
        brokers: brokers.clone(),
        user_notifications_database_addr: "127.0.0.1:9042".to_owned(),
        notification_preferences_database_addr: "127.0.0.1:9042".to_owned(),
        clients_node_addr: "0.0.0.0:7979".to_owned(),
        metrics_receiver_addr: "0.0.0.0:6979".to_owned(),
    };

    tokio::spawn(async move {
        app::consumer::start(config, get_jwt_secret()).await;
    });

    sleep(Duration::from_secs(1)).await;

    let client_id = Uuid::new_v4();
    let sender_id = Uuid::new_v4();

    let client_handle = tokio::spawn(run_client(consumer_addr, client_id));
    produce_stream_data(brokers, topic, &vec![client_id], sender_id).await;

    client_handle.await.expect("Client task failed");
}

#[tokio::test]
#[serial]
#[should_panic]
pub async fn test_consumer_notification_preferences_push() {
    start_docker_compose().await;

    let consumer_addr = "127.0.0.1:7980".to_owned();
    let brokers = "localhost:9092".to_owned();
    let topic = "user-notifs".to_owned();
    let cassandra_addr = "127.0.0.1:9042".to_owned();

    let config = ConsumerConfig {
        topic: topic.clone(),
        brokers: brokers.clone(),
        user_notifications_database_addr: cassandra_addr.clone(),
        notification_preferences_database_addr: cassandra_addr.clone(),
        clients_node_addr: "0.0.0.0:7980".to_owned(),
        metrics_receiver_addr: "0.0.0.0:6980".to_owned(),
    };

    tokio::spawn(async move {
        app::consumer::start(config, get_jwt_secret()).await;
    });

    let db_session = SessionBuilder::new()
        .known_node(cassandra_addr)
        .build()
        .await
        .unwrap();

    let repository = Arc::new(CassandraNotificationPreferencesRepository::new(db_session));
    let service = NotificationPreferencesService::new(repository);

    let userid = Uuid::new_v4();
    let sender_id = Uuid::new_v4();

    let preferences = NotificationPreferencesEntity::new(userid, "DM".to_string(), sender_id, 1);
    service.mute(&preferences).await.expect("Failed to mute");

    let client_handle = tokio::spawn(run_client(consumer_addr, userid));

    sleep(Duration::from_secs(1)).await;
    produce_stream_data(brokers, topic, &vec![userid], sender_id).await;

    client_handle.await.unwrap();
}
