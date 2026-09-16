mod controllers;
mod utils;

use axum::{
    Router,
    routing::{get, delete}
};
use crate::controllers::vapid::{metadata, unregister};

#[tokio::main]
async fn main() {
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, router()).await.unwrap();
}

fn router() -> Router {
    Router::new()
        .route("/api/v1/push-notifications/metadata", get(metadata))
        .route("/api/v1/push-notifications/unregister", delete(unregister))
}
