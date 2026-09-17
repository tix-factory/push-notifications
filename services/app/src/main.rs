mod controllers;
mod utils;

use axum::{
    Router,
    routing::{get, delete, post}
};
use crate::controllers::vapid::{metadata, registration, register, unregister};

#[tokio::main]
async fn main() {
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await
        .unwrap();
    println!("listening on {} (until SIGTERM)", listener.local_addr().unwrap());
    axum::serve(listener, router())
        .with_graceful_shutdown(shutdown_signal())
        .await.unwrap();
    println!("container is shutting down");
}

fn router() -> Router {
    Router::new()
        .route("/api/v1/push-notifications/metadata", get(metadata))
        .route("/api/v1/push-notifications/registration", get(registration))
        .route("/api/v1/push-notifications/register", post(register))
        .route("/api/v1/push-notifications/unregister", delete(unregister))
}

async fn shutdown_signal() {
    tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
        .expect("install SIGTERM handler")
        .recv()
        .await;
}
