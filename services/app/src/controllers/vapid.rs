use axum::{
    body::Body,
    extract::State,
    http::{Response, StatusCode},
    response::IntoResponse,
    Json
};
use axum_extra::extract::{cookie::Cookie, CookieJar};
use serde::Serialize;
use worker::{Env};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use crate::utils::{read_public_key};

const AUTH_COOKIE_NAME: &str = "auth_token";

#[derive(Serialize)]
struct Metadata {
    /// The URL-safe base64 encoded VAPID public key.
    #[serde(rename = "publicKey")]
    public_key: String
}

/// The metadata endpoint used by the web app to load the VAPID public key.
pub async fn metadata(State(env): State<Env>) -> Response<Body> {
    let public_key = read_public_key(env);
    let body = Metadata {
        public_key: URL_SAFE_NO_PAD.encode(public_key.to_sec1_bytes())
    };

    (
        Json(body),
    ).into_response()
}

/// Forgets the push notification registration information.
pub async fn unregister(cookies: CookieJar) -> StatusCode {
    let cookie = Cookie::build((AUTH_COOKIE_NAME, ""))
        .path("/")
        .max_age(time::Duration::ZERO)
        .build();
    let _ = cookies.remove(cookie);

    StatusCode::NO_CONTENT
}
