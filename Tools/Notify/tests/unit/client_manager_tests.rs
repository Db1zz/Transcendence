#[cfg(test)]
mod tests {
    use futures::{SinkExt, StreamExt};
    use notify::manager::ClientsManager;
    use std::sync::Arc;
    use tokio::time::{sleep, timeout, Duration, Instant};
    use tokio_tungstenite::tungstenite::Message;
    use uuid::Uuid;

    use crate::utils::generate_token_for_test;

    const TEST_JWT_SECRET: &str = "test_secret_key_123";

    async fn start_manager(addr: &str) -> Arc<ClientsManager> {
        let manager =
            Arc::new(ClientsManager::new(addr.to_string(), TEST_JWT_SECRET.to_string()).await);

        let listener = manager.clone();
        tokio::spawn(async move {
            listener.listen().await;
        });

        sleep(Duration::from_millis(100)).await;
        manager
    }

    async fn wait_for_state(
        manager: &Arc<ClientsManager>,
        userid: Uuid,
        expected_present: bool,
        timeout_dur: Duration,
    ) -> bool {
        let deadline = Instant::now() + timeout_dur;

        loop {
            // Check if client is in the map and responding to pings
            let is_present = manager.is_client_connected(userid).await;

            if is_present == expected_present {
                return true;
            }

            if Instant::now() >= deadline {
                return false;
            }

            sleep(Duration::from_millis(25)).await;
        }
    }

    #[tokio::test]
    async fn registers_client_with_valid_jwt() {
        let addr = "127.0.0.1:19079";
        let manager = start_manager(addr).await;
        let user_id = Uuid::new_v4();

        // 1. Generate a valid token
        let token = generate_token_for_test(user_id, TEST_JWT_SECRET);

        // 2. Connect and send the token as the first message
        let mut ws_stream = crate::utils::connect_to_manager(addr).await;
        ws_stream.send(Message::Text(token.into())).await.unwrap();

        assert!(
            wait_for_state(&manager, user_id, true, Duration::from_secs(2)).await,
            "Client should be authenticated and registered in DashMap"
        );

        drop(ws_stream);
    }

    #[tokio::test]
    async fn rejects_invalid_jwt() {
        let addr = "127.0.0.1:19081";
        let manager = start_manager(addr).await;

        let mut ws_stream = crate::utils::connect_to_manager(addr).await;

        ws_stream
            .send(Message::Text("not.a.real.jwt".into()))
            .await
            .unwrap();

        sleep(Duration::from_millis(200)).await;

        assert_eq!(
            manager.get_clients_count(),
            0,
            "Manager should have rejected the invalid token"
        );
    }

    #[tokio::test]
    async fn removes_client_on_disconnect() {
        let addr = "127.0.0.1:19080";
        let manager = start_manager(addr).await;
        let user_id = Uuid::new_v4();
        let token = generate_token_for_test(user_id, TEST_JWT_SECRET);

        let mut ws_stream = crate::utils::connect_to_manager(addr).await;
        ws_stream.send(Message::Text(token.into())).await.unwrap();

        assert!(wait_for_state(&manager, user_id, true, Duration::from_secs(2)).await);

        drop(ws_stream);

        assert!(
            wait_for_state(&manager, user_id, false, Duration::from_secs(3)).await,
            "Client should be purged from map after socket closure"
        );
    }

    #[tokio::test]
    async fn prevents_duplicate_connections_for_same_user() {
        let addr = "127.0.0.1:19100";
        let manager = start_manager(addr).await;
        let user_id = Uuid::new_v4();
        let token = generate_token_for_test(user_id, TEST_JWT_SECRET);

        let mut stream1 = crate::utils::connect_to_manager(addr).await;
        stream1
            .send(Message::Text(token.clone().into()))
            .await
            .unwrap();

        assert!(wait_for_state(&manager, user_id, true, Duration::from_secs(1)).await);

        let mut stream2 = crate::utils::connect_to_manager(addr).await;
        stream2.send(Message::Text(token.into())).await.unwrap();
        let result = timeout(Duration::from_secs(1), stream2.next()).await;
        match result {
            Ok(msg) => {
                assert!(msg.is_none() || matches!(msg, Some(Ok(Message::Close(_)))));
            }
            Err(_) => panic!("Second connection was not closed by the manager"),
        }

        assert_eq!(manager.get_clients_count(), 1);
    }
}
