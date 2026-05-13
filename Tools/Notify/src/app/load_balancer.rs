use crate::{config::LoadBalancerConfig, service::load_balancer_service::LoadBalancer};

pub async fn start(config: LoadBalancerConfig) {
    let mut lb =
        LoadBalancer::new(config.load_balancer_addr, config.load_balancer_metrics_addr).await;
    lb.start().await;
}
