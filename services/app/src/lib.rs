mod utils;

use axum::{
    body::Body,
    http::{Response},
    response::IntoResponse,
    Json,
    Router,
    routing::get
};
use serde::Serialize;
use tower_service::Service;
use worker::{HttpRequest, Env, Context, Result, event};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use crate::utils::read_public_key;

#[derive(Serialize)]
struct Metadata {
    #[serde(rename = "publicKey")]
    public_key: String
}

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

pub async fn metadata(env: Env) -> Response<Body> {
    let public_key = read_public_key(env);
    let body = Metadata {
        public_key: URL_SAFE_NO_PAD.encode(public_key.to_sec1_bytes())
    };

    (
        Json(body),
    ).into_response()
}
