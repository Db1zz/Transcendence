pub mod api;
pub mod config;
pub mod consumer;
pub mod entity;
pub mod error;
pub mod manager;
pub mod metrics;
pub mod models;
pub mod repository;
pub mod security;
pub mod service;
pub mod utility;

mod app;

use core::panic;
use std::fs;

use crate::config::parser;
use clap::{Parser, Subcommand};
use tracing::{error, instrument};

#[derive(Parser)]
#[command(name = "Notify", about = "Notification Service for Kafka")]
struct Cli {
    #[command(subcommand)]
    command: Service,
}

#[derive(Subcommand)]
enum Service {
    Producer,
    Consumer,
    LoadBalancer,
}

#[instrument(skip(path))]
fn get_config_string(path: Option<String>) -> String {
    let config_path = match path {
        Some(path) => path,
        None => "./config.yaml".to_owned(),
    };

    match fs::read_to_string(config_path.clone()) {
        Ok(data) => data,
        Err(e) => {
            error!(
                error = ?e,
                config_path = ?config_path,
                "Unable to read a conifg file"
            );
            panic!();
        }
    }
}

fn get_jwt_secret() -> String {
    let r = match std::env::var("JWT_SECRET") {
        Ok(s) => s,
        Err(_) => panic!("Environment variable JWT_SECRET not found!"),
    };

    r
}

#[tokio::main]
#[instrument()]
async fn main() {
    tracing_subscriber::fmt()
        .with_target(true) // - shows which module/service the log came from
        .with_thread_ids(true)
        .with_level(true)
        .init();

    dotenvy::dotenv().ok(); // Load .env files

    // Get config path from a CLI or use default path...
    let config_raw_data = get_config_string(None);
    let result = parser::parse(config_raw_data);
    let config = match result {
        Ok(c) => c,
        Err(e) => {
            error!(error = ?e, "Failed to parse config");
            panic!();
        }
    };

    let cli = Cli::parse();
    match cli.command {
        Service::Consumer => {
            app::consumer::start(config.consumer.unwrap(), get_jwt_secret()).await;
        }

        Service::Producer => {
            app::producer::start(config.producer.unwrap()).await;
        }

        Service::LoadBalancer => {
            app::load_balancer::start(config.load_balancer.unwrap()).await;
        }
    }
}
