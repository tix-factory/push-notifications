mod controllers;
mod utils;

use axum::{
    body::Body,
    http::{Response},
    Router,
    routing::{get, delete}
};
use tower_service::Service;
use worker::{HttpRequest, Env, Context, Result, event};
use crate::controllers::vapid::{metadata, unregister};

fn router(env: Env) -> Router {
    Router::new()
        .route("/api/v1/push-notifications/metadata", get(metadata))
        .route("/api/v1/push-notifications/unregister", delete(unregister))
        .with_state(env)
}

#[event(fetch)]
async fn fetch(
    req: HttpRequest,
    env: Env,
    _ctx: Context,
) -> Result<Response<Body>> {
    Ok(router(env).call(req).await?)
}
