use std::sync::Arc;
use tokio::{net::TcpListener, sync::Mutex};

use crate::metrics::metrics_receiver::MetricsReceiver;
use crate::{manager::task_manager::TaskManager, service::task::LoadBalancerTask};

pub struct LoadBalancer {
    listener: Arc<TcpListener>,
    task_manager: TaskManager<LoadBalancerTask>,
    metrics_receiver: Arc<MetricsReceiver>,
}

impl LoadBalancer {
    pub async fn new(addr: String, metrics_receiver_addr: String) -> Self {
        Self {
            listener: Arc::new(TcpListener::bind(addr).await.unwrap()),

            task_manager: TaskManager::new(5),
            metrics_receiver: Arc::new(MetricsReceiver::new(metrics_receiver_addr).await),
        }
    }

    pub async fn start(&mut self) {
        self.task_manager.start();
        let metrics_receiver = self.metrics_receiver.clone();

        tokio::spawn(async move {
            metrics_receiver.start().await;
        });

        loop {
            let (socket, _) = self.listener.accept().await.unwrap();
            let (_, writer) = socket.into_split();
            let protected_writer = Arc::new(Mutex::new(writer));

            let task = LoadBalancerTask::new(protected_writer, self.metrics_receiver.clone());
            self.task_manager.submit(task).await;
        }
    }
}
