use axum::Router;
pub trait ApiRouter {
    fn get_router(&self) -> Router;
}
