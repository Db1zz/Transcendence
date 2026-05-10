use rdkafka::{
    producer::{FutureProducer, FutureRecord},
    ClientConfig,
};
use std::time::Duration;

use std::sync::Arc;
use tokio::{io::AsyncReadExt, net::TcpListener};
use tracing::{info, instrument};

use crate::config::ProducerConfig;

// TODO redesign this shit bro wtf lmao
#[instrument(skip(config))]
pub async fn start(config: ProducerConfig) {
    let producer: Arc<FutureProducer> = Arc::new(
        ClientConfig::new()
            .set("bootstrap.servers", config.brokers)
            .set("message.timeout.ms", "5000")
            .create()
            .expect("Producer creation error"),
    );

    let listener = TcpListener::bind(config.producer_addr.clone())
        .await
        .unwrap();
    // info!("Socket server started on {}", config.producer_addr);

    loop {
        let (mut socket, client_addr) = listener.accept().await.unwrap();
        info!(cl_addr = client_addr.to_string(), "Client connected");

        let producer = producer.clone();
        let topic = config.topic.clone();
        tokio::spawn(async move {
            loop {
                let mut buf = [0; 1024];
                let n = socket.read(&mut buf).await.unwrap();

                if n == 0 {
                    return;
                }

                let message = String::from_utf8_lossy(&buf[..n]).to_string();
                let _ = producer
                    .send(
                        FutureRecord::to(&topic).payload(message.as_bytes()).key(""),
                        Duration::from_secs(5),
                    )
                    .await;
            }
        });
    }
}
