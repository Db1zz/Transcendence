use std::process::Stdio;
use std::sync::Once;
use std::{net::SocketAddr, time::SystemTime};
use tracing_subscriber::fmt;

use std::time::{Duration, UNIX_EPOCH};

use futures::SinkExt;
use jsonwebtoken::{encode, EncodingKey, Header};
use notify::security::jwt::Claims;
use scylla::client::session_builder::SessionBuilder;
use tokio::{
    net::TcpStream,
    process::Command,
    sync::OnceCell,
    time::{sleep, timeout, Instant},
};
use tokio_tungstenite::{connect_async, tungstenite::Message, MaybeTlsStream, WebSocketStream};
use uuid::Uuid;

static DOCKER_COMPOSE: OnceCell<()> = OnceCell::const_new();
static TRACING: Once = Once::new();

fn init_tracing() {
    TRACING.call_once(|| {
        fmt()
            .with_target(true) // - shows which module/service the log came from
            .with_thread_ids(true)
            .with_level(true)
            .init();
    });
}

pub async fn start_docker_compose() {
    DOCKER_COMPOSE
        .get_or_init(|| async {
            Command::new("docker-compose")
                .args(["-f", "docker-compose.test.yaml", "up", "-d"])
                .stdout(Stdio::inherit())
                .stderr(Stdio::inherit())
                .status()
                .await
                .expect("docker-compose up failed");

            wait_for_kafka("127.0.0.1:9092".parse().unwrap(), Duration::from_secs(30)).await;
            wait_for_cassandra("127.0.0.1:9042").await;
        })
        .await;
    init_tracing();
}

async fn wait_for_kafka(addr: SocketAddr, timeout_dur: Duration) {
    let deadline = Instant::now() + timeout_dur;

    loop {
        let connect = timeout(Duration::from_millis(300), TcpStream::connect(addr)).await;

        if matches!(connect, Ok(Ok(_))) {
            return;
        }

        if Instant::now() >= deadline {
            panic!("Kafka did not become ready at {addr}");
        }

        sleep(Duration::from_millis(500)).await;
    }
}

async fn wait_for_cassandra(addr: &str) {
    for _ in 0..60 {
        let res = SessionBuilder::new().known_node(addr).build().await;

        if res.is_ok() {
            println!("Cassandra is up!");
            return;
        }

        println!("Waiting for Cassandra...");
        sleep(Duration::from_secs(1)).await;
    }

    panic!("Cassandra did not start");
}

pub async fn connect_to_manager(addr: &str) -> WebSocketStream<MaybeTlsStream<TcpStream>> {
    let protocol = "ws://".to_owned();
    let client_addr = protocol + addr;

    let (ws_stream, _) = connect_async(client_addr).await.expect("Failed to connect");

    ws_stream
}

pub async fn register_client(
    addr: &str,
    userid: Uuid,
) -> WebSocketStream<MaybeTlsStream<TcpStream>> {
    let mut ws_stream = connect_to_manager(addr).await;
    let payload = serde_json::json!({ "userid": userid }).to_string();
    let message = Message::from(payload);

    match ws_stream.send(message).await {
        Ok(_) => ws_stream,
        Err(e) => panic!("Failed to register a user {:?}", e),
    }
}

pub fn generate_token_for_test(user_id: Uuid, secret: &str) -> String {
    let expiration = (SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        + 3600) as usize;

    let claims = Claims::new("zxc@zxc.zxc".to_owned(), user_id, expiration);

    let header = Header::default();
    let key = EncodingKey::from_secret(secret.as_ref());

    encode(&header, &claims, &key).expect("Failed to generate test JWT")
}

pub fn get_jwt_secret() -> String {
    "zxczxczxczxczxczxczxczxzxczxczxc".to_owned()
}
