mod controllers;
mod utils;

use axum::{
    body::Body,
    http::{Response},
    Router,
    routing::get
};
use tower_service::Service;
use worker::{HttpRequest, Env, Context, Result, event};
use crate::controllers::vapid::{metadata};

fn router(env: Env) -> Router {
    Router::new().route("/api/v1/push-notifications/metadata", get(|| metadata(env)))
}

#[event(fetch)]
async fn fetch(
    req: HttpRequest,
    env: Env,
    _ctx: Context,
) -> Result<Response<Body>> {
    Ok(router(env).call(req).await?)
}
