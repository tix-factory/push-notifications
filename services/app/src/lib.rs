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
use p256::{pkcs8::DecodePublicKey,PublicKey};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};

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
    let raw_public_key = env.var("VAPID__PUBLIC_KEY").expect("VAPID__PUBLIC_KEY is not set.").to_string();
    let public_key = PublicKey::from_public_key_pem(&raw_public_key);
    let body = Metadata {
        public_key: URL_SAFE_NO_PAD.encode(public_key.unwrap().to_sec1_bytes())
    };

    (
        Json(body),
    ).into_response()
}
