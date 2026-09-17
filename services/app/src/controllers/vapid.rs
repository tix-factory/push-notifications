use std::env;
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
use web_push::{ContentEncoding, IsahcWebPushClient, SubscriptionInfo, VapidSignatureBuilder, WebPushClient, WebPushMessageBuilder};
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

#[derive(Serialize)]
pub struct Notification {
    /// The notification title.
    title: String,

    /// The text content of the notification.
    message: String,

    /// The buttons to display on the notification.
    buttons: [String; 1],

    /// The icon image to use for the notification.
    icon: String,

    /// The link that the notification will open when clicked.
    link: String,

    /// The link that the first button in the notification will open, when clicked.
    #[serde(rename = "buttonLink")]
    button_link: String,
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

/// Sends a push notification to the endpoint that was previously registered.
pub async fn push(cookies: CookieJar) -> StatusCode {
    // Read the registered push notification details, from the browser/cookie.
    let cookie = fetch(cookies);
    if !cookie.is_ok() {
        return StatusCode::UNAUTHORIZED;
    }

    let auth = cookie.unwrap();
    let subscription_info = SubscriptionInfo::new(
        auth.sub,
        auth.p256dh,
        auth.auth
    );

    // Read signing material for payload.
    let raw_private_key = env::var("VAPID__PRIVATE_KEY").expect("VAPID__PRIVATE_KEY is not set.");
    let sig_builder = VapidSignatureBuilder::from_pem(raw_private_key.as_bytes(), &subscription_info).unwrap().build().unwrap();

    // Now add payload and encrypt.
    let mut builder = WebPushMessageBuilder::new(&subscription_info);
    let content = "Encrypted payload to be sent in the notification".as_bytes();
    let notification = Notification {
        title: "Hello, world!".to_string(),
        message: "This notification was sent using the push API.".to_string(),
        icon: "https://cdn.jsdelivr.net/gh/twitter/twemoji@v14.0.2/assets/72x72/1f514.png".to_string(),
        link: "https://demo.push-notifications.app?notification_clicked=true".to_string(),
        button_link: "https://github.com/tix-factory/push-notifications/issues".to_string(),
        buttons: ["🐛 File Bug".to_string()]
    };
    let json = serde_json::to_string(&notification).unwrap();
    builder.set_payload(ContentEncoding::Aes128Gcm, json.as_bytes());
    builder.set_vapid_signature(sig_builder);

    // Finally, send the notification!
    let client = IsahcWebPushClient::new();
    let result = client.unwrap().send(builder.build().unwrap()).await;
    if result.is_ok() {
        println!("Failed to send push notification: {}", result.err().unwrap());
        return StatusCode::INTERNAL_SERVER_ERROR;
    }

    StatusCode::NO_CONTENT
}
