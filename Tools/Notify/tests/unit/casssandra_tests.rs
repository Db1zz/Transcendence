use notify::{
    entity::{
        NotificationPreferencesEntity, NotificationPreferencesKey, NotificationToSendKey,
        UserNotificationEntity,
    },
    repository::{
        CassandraNotificationPreferencesRepository, CassandraUserNotificationsRepository,
        NotificationPreferencesRepository, UserNotificationsRepository,
    },
};
use scylla::client::session_builder::SessionBuilder;
use uuid::Uuid;

use crate::utils::start_docker_compose;

async fn get_test_session() -> scylla::client::session::Session {
    let cassandra_addr = "127.0.0.1:9042";
    SessionBuilder::new()
        .known_node(cassandra_addr)
        .build()
        .await
        .expect("Failed to connect to ScyllaDB")
}

#[tokio::test]
async fn test_get_preferences_not_found() {
    start_docker_compose().await;
    let session = get_test_session().await;
    let repo = CassandraNotificationPreferencesRepository::new(session);

    let key =
        NotificationPreferencesKey::new(Uuid::new_v4(), "CHANNEL".to_string(), Uuid::new_v4());

    let result = repo.get(&key).await;

    assert!(result.is_err());
}

#[tokio::test]
async fn test_post_and_get_preferences_success() {
    start_docker_compose().await;
    let session = get_test_session().await;
    let repo = CassandraNotificationPreferencesRepository::new(session);

    let user_id = Uuid::new_v4();
    let target_id = Uuid::new_v4();
    let entity = NotificationPreferencesEntity::new(user_id, "SERVER".to_string(), target_id, 1);
    let key = NotificationPreferencesKey::new(user_id, "SERVER".to_string(), target_id);

    repo.post(&entity)
        .await
        .expect("Failed to insert preference");

    let result = repo.get(&key).await;
    assert!(result.is_ok());
    let found = result.unwrap();
    assert_eq!(found.mute_level, 1);
}

#[tokio::test]
async fn test_get_user_notification_not_found() {
    start_docker_compose().await;
    let session = get_test_session().await;
    let repo = CassandraUserNotificationsRepository::new(session);

    let key = NotificationToSendKey::new(Uuid::new_v4(), Uuid::new_v4());

    let result = repo.get(&key).await;
    assert!(result.is_err());
}

#[tokio::test]
async fn test_post_and_get_user_notification_success() {
    start_docker_compose().await;
    let session = get_test_session().await;
    let repo = CassandraUserNotificationsRepository::new(session);

    let user_id = Uuid::new_v4();
    let entity = UserNotificationEntity::new(
        user_id,
        "MESSAGE_CREATED".to_string(),
        "DM".to_string(),
        "{\"text\": \"Hello!\"}".to_string(),
    );

    // We need the generated ID to fetch it back
    let key = NotificationToSendKey::new(user_id, entity.id);

    repo.post(&entity)
        .await
        .expect("Failed to insert notification");

    let result = repo.get(&key).await;
    assert!(result.is_ok());
    assert_eq!(result.unwrap().payload, "{\"text\": \"Hello!\"}");
}

#[tokio::test]
async fn test_get_all_notifications_for_user() {
    start_docker_compose().await;
    let session = get_test_session().await;
    let repo = CassandraUserNotificationsRepository::new(session);

    let user_id = Uuid::new_v4();
    let entity1 =
        UserNotificationEntity::new(user_id, "TYPE1".into(), "SCOPE1".into(), "P1".into());
    let entity2 =
        UserNotificationEntity::new(user_id, "TYPE2".into(), "SCOPE2".into(), "P2".into());

    repo.post(&entity1).await.unwrap();
    repo.post(&entity2).await.unwrap();

    let list = repo.get_all(user_id).await.expect("Failed to fetch list");
    assert_eq!(list.len(), 2);
}
