use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Config {
    pub consumer: Option<ConsumerConfig>,
    pub load_balancer: Option<LoadBalancerConfig>,
    pub producer: Option<ProducerConfig>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ConsumerConfig {
    pub topic: String,
    pub brokers: String,
    pub user_notifications_database_addr: String,
    pub notification_preferences_database_addr: String,
    pub clients_node_addr: String,
    pub metrics_receiver_addr: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LoadBalancerConfig {
    pub load_balancer_addr: String,
    pub load_balancer_metrics_addr: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProducerConfig {
    pub producer_addr: String,
    pub topic: String,
    pub brokers: String,
}
