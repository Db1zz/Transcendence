use tokio::net::TcpListener;

use crate::api::router::ApiRouter;

pub struct ApiRunner<T: ApiRouter> {
    runner_addr: String,
    api_router: T,
}

impl<T: ApiRouter> ApiRunner<T> {
    pub fn new(runner_addr: String, api_router: T) -> Self {
        Self {
            runner_addr,
            api_router,
        }
    }

    pub fn run(self) {
        let router = self.api_router.get_router();
        let runner_addr = self.runner_addr.clone();
        tokio::spawn(async move {
            let listener: TcpListener = TcpListener::bind(runner_addr).await.unwrap();
            axum::serve(listener, router).await.unwrap();
        });
    }
}
