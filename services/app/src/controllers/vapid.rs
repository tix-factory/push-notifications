use axum::{
    body::Body,
    http::{Response, StatusCode},
    response::IntoResponse,
    Json
};
use axum_extra::extract::{CookieJar};
use chrono::{Utc};
use serde::{Serialize, Deserialize};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use crate::utils::{VAPID_PUBLIC_KEY};
use crate::cookies::{AuthCookie, authenticate, clear, fetch};

#[derive(Serialize)]
struct Metadata {
    /// The URL-safe base64 encoded VAPID public key.
    #[serde(rename = "publicKey")]
    public_key: String
}

#[derive(Serialize)]
struct RegistrationResponse {
    /// The endpoint to send the notification to.
    endpoint: String,
}

#[derive(Deserialize)]
pub struct RegisterPayload {
    /// The endpoint to send the notification to.
    endpoint: String,

    /// When the push subscription will expire.
    ///
    /// Browsers have the ability to expire the endpoint after a set amount of time.
    /// This property reflects the expiration, if it exists.
    /// See also: https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/expirationTime
    expiration: Option<String>,

    /// The (base64 encoded) public key the push subscription is subscribed with.
    p256dh: String,

    /// The (base64 encoded) authentication secret for the push subscription.
    auth: String,
}

/// The metadata endpoint used by the web app to load the VAPID public key.
pub async fn metadata() -> Response<Body> {
    let body = Metadata {
        public_key: URL_SAFE_NO_PAD.encode(VAPID_PUBLIC_KEY.to_sec1_bytes())
    };

    (
        Json(body),
    ).into_response()
}

/// Gets the current push notification registration status.
pub async fn registration(cookies: CookieJar) -> impl IntoResponse {
    let cookie = fetch(cookies);
    if cookie.is_ok() {
        return Json(RegistrationResponse {
            endpoint: cookie.unwrap().sub
        }).into_response();
    }

    StatusCode::UNAUTHORIZED.into_response()
}

/// Forgets the push notification registration information.
pub async fn register(cookies: CookieJar, Json(request): Json<RegisterPayload>) -> (StatusCode, CookieJar) {
    let claims = AuthCookie {
        sub: request.endpoint,
        p256dh: request.p256dh,
        auth: request.auth,
        exp: (Utc::now().timestamp() + (3600 * 24 * 7)) as usize
    };

    (StatusCode::NO_CONTENT, authenticate(cookies, claims))
}


/// Forgets the push notification registration information.
pub async fn unregister(cookies: CookieJar) -> (StatusCode, CookieJar) {
    (StatusCode::NO_CONTENT, clear(cookies))
}
