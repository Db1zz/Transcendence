use std::sync::Arc;

use axum::{
    extract::{Request, State},
    http::{header, StatusCode},
    middleware::Next,
    response::Response,
    routing::get,
    routing::post,
    Extension, Json, Router,
};
use serde::Deserialize;
use tower_http::cors::{Any, CorsLayer};
use uuid::Uuid;

use crate::repository::UserNotificationsRepository;
use crate::{
    api::router::ApiRouter,
    entity::NotificationToSendKey,
    models::Notification,
    repository::CassandraUserNotificationsRepository,
    security::jwt::{validate_token, Claims},
};
use tracing::{error, instrument};

#[derive(Deserialize)]
struct MarkReadRequest {
    pub notification_ids: Vec<Uuid>,
}

pub struct NotificationRouter {
    router: Router,
}

impl NotificationRouter {
    pub fn new(user_notifications: Arc<CassandraUserNotificationsRepository>) -> Self {
        let cors = CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE]);

        let router = Router::new()
            .route("/notification", get(Self::get_notifications))
            .route("/notification/read", post(Self::mark_as_read))
            .layer(axum::middleware::from_fn(Self::auth_middleware))
            .layer(cors)
            .with_state(user_notifications);

        Self { router }
    }

    async fn get_notifications(
        State(user_notifications): State<Arc<CassandraUserNotificationsRepository>>,
        Extension(claims): Extension<Claims>,
    ) -> Result<Json<Vec<Notification>>, StatusCode> {
        let notifications = user_notifications
            .get_all(claims.user_id)
            .await
            .map_err(|e| {
                error!(error = ?e, "while retrieving notifications");
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        let notifications: Vec<Notification> =
            notifications.into_iter().map(Notification::from).collect();

        Ok(Json(notifications))
    }

    #[instrument(skip(user_notifications, claims, payload))]
    async fn mark_as_read(
        State(user_notifications): State<Arc<CassandraUserNotificationsRepository>>,
        Extension(claims): Extension<Claims>,
        Json(payload): Json<MarkReadRequest>,
    ) -> Result<StatusCode, StatusCode> {
        for id in payload.notification_ids.iter() {
            let key = NotificationToSendKey::new(claims.user_id, *id);
            let result = user_notifications.remove(key).await;
            if result.is_err() {
                error!(error = ?result.err(), "while updating is_read status in user notifications");
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }
        }

        Ok(StatusCode::OK)
    }

    async fn auth_middleware(mut req: Request, next: Next) -> Result<Response, StatusCode> {
        let auth_header = req
            .headers()
            .get(header::AUTHORIZATION)
            .and_then(|h| h.to_str().ok())
            .ok_or(StatusCode::UNAUTHORIZED)?
            .strip_prefix("Bearer ")
            .ok_or(StatusCode::UNAUTHORIZED)?;

        let jwt_secret = match std::env::var("JWT_SECRET") {
            Ok(s) => s,
            Err(_) => panic!("Environment variable JWT_SECRET not found!"),
        };

        let claims =
            validate_token(auth_header, &jwt_secret).map_err(|_| StatusCode::UNAUTHORIZED)?;

        req.extensions_mut().insert(claims);

        Ok(next.run(req).await)
    }
}

impl ApiRouter for NotificationRouter {
    fn get_router(&self) -> Router {
        self.router.clone()
    }
}
