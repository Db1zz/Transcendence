use dashmap::DashMap;
use std::{net::SocketAddr, sync::Arc, time::Instant};
use tokio::{
    io::{AsyncBufReadExt, BufReader},
    net::{TcpListener, TcpStream},
    sync::mpsc::{self, Receiver, Sender},
    time::{timeout, Duration},
};
use tracing::{error, info, instrument, warn, Instrument};

use crate::metrics::{ConnectionLost, Message};

struct ClientInfo {
    pub load: f64,
    pub last_seen: Instant,
}

pub struct MetricsReceiver {
    clients: Arc<DashMap<String, ClientInfo>>,
    listener: TcpListener,
}

impl MetricsReceiver {
    pub async fn new(receiver_addr: String) -> Self {
        Self {
            clients: Arc::new(DashMap::new()),
            listener: TcpListener::bind(receiver_addr).await.unwrap(),
        }
    }

    #[instrument(
		skip(socket, tx),
		fields(
			cl_addr = %client_addr,
			public_addr = tracing::field::Empty
		)
	)]
    async fn handle_connection(socket: TcpStream, tx: Sender<Message>, client_addr: SocketAddr) {
        let (reader, _writer) = socket.into_split();
        let mut breader = BufReader::new(reader);
        let mut line = String::new();
        let mut client_public_addr = String::new();

        info!("New connection established");

        loop {
            line.clear();

            let read_res = timeout(Duration::from_secs(10), breader.read_line(&mut line)).await;
            match read_res {
                Ok(Ok(0)) => {
                    info!("Client disconnected (EOF)");
                    break;
                }
                Ok(Ok(_)) => match serde_json::from_str::<Message>(&line) {
                    Ok(msg) => {
                        if client_public_addr.is_empty() {
                            if let Message::Register(data) = &msg {
                                client_public_addr = data.public_addr.clone();
                                tracing::Span::current().record("public_addr", &data.public_addr);
                                info!("Client registered successfully");
                            } else {
                                warn!("Protocol violation: First message must be Register");
                                return;
                            }
                        }

                        if let Err(e) = tx.send(msg).await {
                            error!(error = ?e, "Internal channel closed");
                            break;
                        };
                        continue;
                    }
                    Err(e) => {
                        error!(error = ?e, raw_line = %line.trim(), "Invalid JSON received");
                        break;
                    }
                },
                Ok(Err(e)) => {
                    error!(error = ?e, "TCP read error");
                    break;
                }
                Err(_) => {
                    warn!("Connection timed out after 10s of inactivity");
                    break;
                }
            }
        }

        let msg = Message::ConnectionLost(ConnectionLost {
            public_addr: client_public_addr,
        });
        let _ = tx.send(msg).await;
    }

    async fn message_handler(mut rx: Receiver<Message>, clients: Arc<DashMap<String, ClientInfo>>) {
        while let Some(msg) = rx.recv().await {
            match msg {
                Message::Register(register) => {
                    clients.insert(
                        register.public_addr,
                        ClientInfo {
                            load: 0.0,
                            last_seen: Instant::now(),
                        },
                    );
                }

                Message::Metrics(metrics) => {
                    if let Some(mut node) = clients.get_mut(&metrics.public_addr) {
                        let node = node.value_mut();
                        node.load = metrics.load;
                        node.last_seen = Instant::now();
                    }
                }

                Message::ConnectionLost(connection_lost) => {
                    clients.remove(&connection_lost.public_addr);
                }
            }
        }
    }

    pub async fn get_least_loaded_consumer_node(&self) -> Result<String, MetricsReceiverError> {
        let result = self
            .clients
            .iter()
            .min_by(|a, b| a.value().load.partial_cmp(&b.value().load).unwrap());

        match result {
            Some(node) => Ok(node.key().clone()),
            None => Err(MetricsReceiverError::NoSenders),
        }
    }

    #[instrument(skip(self))]
    pub async fn start(&self) {
        let (tx, rx) = mpsc::channel::<Message>(1024);
        let clients = self.clients.clone();

        tokio::spawn(Self::message_handler(rx, clients));

        loop {
            let (socket, client_addr) = match self.listener.accept().await {
                Ok(v) => v,
                Err(e) => {
                    warn!(error = ?e, "TCP accept error");
                    continue;
                }
            };

            let connection_span =
                tracing::info_span!("connection_worker", service = "metrics_receiver");
            tokio::spawn(
                Self::handle_connection(socket, tx.clone(), client_addr)
                    .instrument(connection_span),
            );
        }
    }
}

#[derive(thiserror::Error, Debug)]
pub enum MetricsReceiverError {
    #[error(
        "No senders are connected to the metrics receiver, so it cannot receive data from void"
    )]
    NoSenders,
}
