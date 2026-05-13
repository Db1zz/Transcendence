use std::sync::Arc;

use dashmap::DashMap;
use futures::{
    stream::{SplitSink, SplitStream},
    SinkExt, StreamExt,
};

use tokio::{
    net::{TcpListener, TcpStream},
    sync::Mutex,
};
use tokio_tungstenite::{
    accept_async,
    tungstenite::{
        protocol::{frame::coding::CloseCode, CloseFrame},
        Bytes, Error, Message, Utf8Bytes,
    },
    WebSocketStream,
};
use tracing::{error, info, instrument, warn};
use uuid::Uuid;

use crate::security::jwt::validate_token;

type WsSink = SplitSink<WebSocketStream<TcpStream>, Message>;
type SharedSink = Arc<Mutex<WsSink>>;
type ClientsMap = DashMap<Uuid, SharedSink>;
type SharedClientsMap = Arc<ClientsMap>;

struct ConnectedClient {
    user_id: Uuid,
    read: SplitStream<WebSocketStream<TcpStream>>,
}

pub struct ClientsManager {
    listener: Arc<TcpListener>,
    connected_clients: SharedClientsMap,
    addr: String,
    jwt_secret: String,
}

impl ClientsManager {
    pub async fn new(addr: String, jwt_secret: String) -> Self {
        Self {
            listener: Arc::new(TcpListener::bind(addr.clone()).await.unwrap()),
            connected_clients: Arc::new(DashMap::new()),
            addr,
            jwt_secret,
        }
    }

    async fn close_connection(write: &mut WsSink, code: CloseCode, reason: impl Into<String>) {
        let frame = CloseFrame {
            code,
            reason: reason.into().into(),
        };

        let _ = write.send(Message::Close(Some(frame))).await;
        let _ = write.close().await;
    }

    async fn connect_client_task(
        connected_clients: SharedClientsMap,
        mut write: SplitSink<WebSocketStream<TcpStream>, Message>,
        mut read: SplitStream<WebSocketStream<TcpStream>>,
        jwt_secret: String,
    ) -> Result<ConnectedClient, ConnectionError> {
        let msg = match read.next().await {
            Some(Ok(m)) => m,
            Some(Err(e)) => {
                return Err(ConnectionError::from(ReadError::Websocket(e)));
            }
            None => {
                return Err(ConnectionError::from(ReadError::UnknownError));
            }
        };

        let token: String = if msg.is_text() {
            msg.to_string()
        } else {
            return Err(ConnectionError::UnknownMessage);
        };

        let claims = match validate_token(&token, &jwt_secret) {
            Ok(c) => c,
            Err(_) => {
                Self::close_connection(
                    &mut write,
                    CloseCode::Invalid,
                    "Invalid authentication token",
                )
                .await;
                return Err(ConnectionError::InvalidAuthenticationToken);
            }
        };

        if connected_clients.contains_key(&claims.user_id) {
            Self::close_connection(&mut write, CloseCode::Policy, "Already Connected").await;
            return Err(ConnectionError::AlreadyConnected(claims.user_id));
        }

        connected_clients.insert(claims.user_id, Arc::new(Mutex::new(write)));

        Ok(ConnectedClient {
            user_id: claims.user_id,
            read,
        })
    }

    #[instrument(skip(connected_clients, client))]
    async fn watch_client_disconnect(
        connected_clients: SharedClientsMap,
        mut client: ConnectedClient,
    ) {
        let mut buf = String::new();

        loop {
            buf.clear();
            let msg = match client.read.next().await {
                Some(Ok(m)) => m,
                Some(Err(e)) => {
                    error!(error = ?e, "This is weird bugggg, should not to happen anyways...");
                    break;
                }
                None => {
                    break;
                }
            };

            if msg.is_close() {
                break;
            }
        }

        if connected_clients.remove(&client.user_id).is_none() {
            error!(
				user_id = client.user_id.to_string(),
				"Client doesn't exists in a dashmap, if you see this message, it means there's a BUG...")
        }
    }

    #[instrument(skip(self))]
    pub async fn listen(&self) {
        loop {
            let (tcp_socket, client_addr) = self.listener.accept().await.unwrap();
            let ws_stream = accept_async(tcp_socket).await.expect("Handshake failed");
            let connected_clients = self.connected_clients.clone();
            let jwt_secret = self.jwt_secret.clone();

            tokio::spawn(async move {
                let (write, read) = ws_stream.split();
                let result =
                    Self::connect_client_task(connected_clients.clone(), write, read, jwt_secret)
                        .await;
                match result {
                    Ok(client) => {
                        info!(
                            cl_addr = client_addr.to_string(),
                            user_id = client.user_id.to_string(),
                            "A new client connected to the server"
                        );
                        Self::watch_client_disconnect(connected_clients, client).await;
                    }
                    Err(e) => {
                        warn!(error = ?e, "Failed to establish connection with a client");
                    }
                }
            });
        }
    }

    fn get_client(&self, id: Uuid) -> Result<SharedSink, SendMessageError> {
        self.connected_clients
            .get(&id)
            .map(|ref_guard| ref_guard.clone())
            .ok_or(SendMessageError::ClientNotFound)
    }

    pub fn get_clients_count(&self) -> usize {
        self.connected_clients.len()
    }

    pub async fn is_client_connected(&self, id: Uuid) -> bool {
        if let Ok(client) = self.get_client(id) {
            let msg = Message::Ping(Bytes::from("ping"));
            return client.lock().await.send(msg).await.is_ok();
        }
        false
    }

    pub async fn send_to_client(&self, id: Uuid, data: String) -> Result<(), SendMessageError> {
        let client = self.get_client(id)?;
        let msg = Message::Text(Utf8Bytes::from(data));

        client.lock().await.send(msg).await?;

        Ok(())
    }

    pub fn destroy_client(&self, client_id: Uuid) {
        self.connected_clients.remove(&client_id);
    }

    pub fn get_addr(&self) -> &String {
        &self.addr
    }
}

#[derive(thiserror::Error, Debug)]
pub enum ReadError {
    #[error(transparent)]
    Websocket(#[from] Error),

    #[error("Unknown read error")]
    UnknownError,
}

#[derive(thiserror::Error, Debug)]
pub enum ConnectionError {
    #[error(transparent)]
    Serialize(#[from] serde_json::Error),

    #[error(transparent)]
    ReadError(#[from] ReadError),

    #[error("User with id {0} is already connected")]
    AlreadyConnected(Uuid),

    #[error("Received unknown message through a websocket")]
    UnknownMessage,

    #[error("User has invalid authentication token")]
    InvalidAuthenticationToken,
}

#[derive(thiserror::Error, Debug)]
pub enum SendMessageError {
    #[error("Client not found")]
    ClientNotFound,

    #[error(transparent)]
    Websocket(#[from] Error),
}
