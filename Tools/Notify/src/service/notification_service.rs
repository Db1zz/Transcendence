use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;
use tracing::{info, instrument, warn, Instrument};

use crate::consumer::notification_stream_consumer::NotificationStreamConsumer;
use crate::manager::task_manager::TaskManager;
use crate::manager::ClientsManager;
use crate::metrics::metrics_sender::MetricsSender;
use crate::metrics::{LoadMetrics, Message, Metrics, NodeRole, Register};
use crate::repository::CassandraUserNotificationsRepository;
use crate::service::task::NotificationServiceTask;
use crate::service::NotificationPreferencesService;

pub struct NotificationService<Consumer>
where
    Consumer: NotificationStreamConsumer,
{
    user_notifications: Arc<CassandraUserNotificationsRepository>,
    notification_preferences: Arc<NotificationPreferencesService>,
    consumer: Arc<Consumer>,
    clients_manager: Arc<ClientsManager>,
    task_manager: TaskManager<NotificationServiceTask>,
    metrics: Arc<LoadMetrics>,
    receiver_addr: String,
}

impl<Consumer> NotificationService<Consumer>
where
    Consumer: NotificationStreamConsumer,
{
    pub fn new(
        user_notifications: Arc<CassandraUserNotificationsRepository>,
        notification_preferences: Arc<NotificationPreferencesService>,
        consumer: Arc<Consumer>,
        clients_manager: Arc<ClientsManager>,
        task_manager: TaskManager<NotificationServiceTask>,
        receiver_addr: String,
    ) -> Self {
        Self {
            user_notifications,
            notification_preferences,
            consumer,
            clients_manager,
            task_manager,
            metrics: Arc::new(LoadMetrics::new()),
            receiver_addr,
        }
    }

    #[instrument(
		skip(receiver_addr, public_addr),
		fields(receiver = %receiver_addr, public = %public_addr)
	)]
    async fn connect_and_register(receiver_addr: String, public_addr: String) -> MetricsSender {
        let mut sender = MetricsSender::new(receiver_addr);

        let register = Register {
            public_addr: public_addr.clone(),
            role: NodeRole::NotificationService,
        };

        let mut attempts = 0;

        while let Err(e) = sender.register(register.clone()).await {
            attempts += 1;
            warn!(
                error = ?e,
                attempt = attempts,
                "Registration failed, retrying in 2s..."
            );
            sleep(Duration::from_secs(2)).await;
        }

        info!("Successfully registered metrics sender");
        sender
    }

    #[instrument(
		skip(self),
		fields(receiver = %self.receiver_addr)
	)]
    async fn spawn_metrics_reporter(&self) {
        let metrics = self.metrics.clone();
        let public_addr = self.clients_manager.get_addr().clone();
        let receiver_addr = self.receiver_addr.clone();

        let worker_span = tracing::info_span!(
            "metrics_reporter",
            receiver = %receiver_addr,
            public = %public_addr
        );

        tokio::spawn(
            async move {
                info!("Metrics reporter worker started");

                loop {
                    let mut sender =
                        Self::connect_and_register(receiver_addr.clone(), public_addr.clone())
                            .await;

                    info!("Connected and registered with receiver");

                    loop {
                        let metrics = Metrics {
                            public_addr: public_addr.clone(),
                            load: metrics.load(),
                        };

                        let result = sender.send(Message::Metrics(metrics)).await;
                        if let Err(e) = result {
                            warn!(error = ?e, "Connection lost; attempting to reconnect...");
                            break;
                        }

                        sleep(Duration::from_secs(5)).await;
                    }
                }
            }
            .instrument(worker_span),
        );
    }

    #[instrument(skip(self))]
    async fn run_notification_consumer(&mut self) {
        loop {
            let notification = match self.consumer.recv().await {
                Ok(notification) => notification,
                Err(e) => {
                    warn!(error = ?e, "Failed to receive a notification");
                    continue;
                }
            };

            let task = NotificationServiceTask::new(
                notification,
                self.user_notifications.clone(),
                self.notification_preferences.clone(),
                self.clients_manager.clone(),
                self.metrics.clone(),
            );
            self.task_manager.submit(task).await;
            self.metrics.inc_queue();
        }
    }

    pub async fn start(&mut self) {
        let clients_manager_clone = self.clients_manager.clone();
        self.task_manager.start();

        tokio::spawn(async move {
            clients_manager_clone.listen().await;
        });

        self.spawn_metrics_reporter().await;
        self.run_notification_consumer().await;
    }
}
