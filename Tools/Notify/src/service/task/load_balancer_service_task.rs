use async_trait::async_trait;
use rdkafka::message::ToBytes;
use std::sync::Arc;

use tokio::{io::AsyncWriteExt, net::tcp::OwnedWriteHalf, sync::Mutex};

use crate::manager::task_manager::TaskManagerTask;
use crate::metrics::metrics_receiver::MetricsReceiver;

pub struct LoadBalancerTask {
    writer: Arc<Mutex<OwnedWriteHalf>>,
    metrics: Arc<MetricsReceiver>,
}

impl LoadBalancerTask {
    pub fn new(writer: Arc<Mutex<OwnedWriteHalf>>, metrics: Arc<MetricsReceiver>) -> Self {
        Self { writer, metrics }
    }
}

#[async_trait]
impl TaskManagerTask for LoadBalancerTask {
    async fn handle(&self) {
        let result = self.metrics.get_least_loaded_consumer_node().await;
        match result {
            Ok(addr) => {
                let _ = self
                    .writer
                    .lock()
                    .await
                    .write_all(addr.to_string().to_bytes())
                    .await;
            }
            Err(e) => {
                eprintln!("Error: {}", e);
            }
        }
    }
}
