use axum::{
    body::Body,
    http::{Response},
    response::IntoResponse,
    Json
};
use serde::Serialize;
use worker::{Env};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use crate::utils::{read_public_key};

#[derive(Serialize)]
struct Metadata {
    /// The URL-safe base64 encoded VAPID public key.
    #[serde(rename = "publicKey")]
    public_key: String
}

/// The metadata endpoint used by the web app to load the VAPID public key.
pub async fn metadata(env: Env) -> Response<Body> {
    let public_key = read_public_key(env);
    let body = Metadata {
        public_key: URL_SAFE_NO_PAD.encode(public_key.to_sec1_bytes())
    };

    (
        Json(body),
    ).into_response()
}
