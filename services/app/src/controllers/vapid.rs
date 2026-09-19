use crate::cookies::{authenticate, clear, fetch, AuthCookie};
use crate::utils::{EMAIL_ADDRESS, VAPID_PUBLIC_KEY};
use axum::{http::StatusCode, response::IntoResponse, Json};
use axum_extra::extract::CookieJar;
use base64::{
    engine::general_purpose::{STANDARD, URL_SAFE_NO_PAD},
    Engine,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::env;
use web_push::{
    ContentEncoding, IsahcWebPushClient, SubscriptionInfo, VapidSignature, VapidSignatureBuilder,
    WebPushClient, WebPushMessage, WebPushMessageBuilder,
};

#[derive(Serialize)]
pub struct Metadata {
    /// The URL-safe base64 encoded VAPID public key.
    #[serde(rename = "publicKey")]
    public_key: String,
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
    ///
    /// For now, we've decided not to implement this into the cookie.
    /// But we have it here in case we want to parse it, and use it.
    #[allow(dead_code)]
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
    #[serde(rename = "iconUrl")]
    icon: String,

    /// The link that the notification will open when clicked.
    link: String,

    /// The link that the first button in the notification will open, when clicked.
    #[serde(rename = "buttonLink")]
    button_link: String,
}

/// The metadata endpoint used by the web app to load the VAPID public key.
pub async fn metadata() -> Json<Metadata> {
    Json(Metadata {
        public_key: URL_SAFE_NO_PAD.encode(VAPID_PUBLIC_KEY.to_sec1_bytes()),
    })
}

/// Gets the current push notification registration status.
pub async fn registration(cookies: CookieJar) -> impl IntoResponse {
    match fetch(cookies) {
        Ok(cookie) => Json(RegistrationResponse {
            endpoint: cookie.sub,
        })
        .into_response(),
        Err(e) => {
            println!("Failed to authorize request: {}", e);
            StatusCode::UNAUTHORIZED.into_response()
        }
    }
}

/// Forgets the push notification registration information.
pub async fn register(
    cookies: CookieJar,
    Json(request): Json<RegisterPayload>,
) -> Result<(StatusCode, CookieJar), StatusCode> {
    let claims = AuthCookie {
        sub: request.endpoint,
        p256dh: URL_SAFE_NO_PAD.encode(STANDARD.decode(request.p256dh).unwrap()),
        auth: URL_SAFE_NO_PAD.encode(STANDARD.decode(request.auth).unwrap()),
        exp: (Utc::now().timestamp() + (3600 * 24 * 7)) as usize,
    };

    match authenticate(cookies, claims) {
        Ok(updated_cookie_jar) => Ok((StatusCode::NO_CONTENT, updated_cookie_jar)),
        Err(e) => {
            println!("Failed to authenticate: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Forgets the push notification registration information.
pub async fn unregister(cookies: CookieJar) -> (StatusCode, CookieJar) {
    (StatusCode::NO_CONTENT, clear(cookies))
}

/// Sends a push notification to the endpoint that was previously registered.
pub async fn push(cookies: CookieJar) -> Result<StatusCode, String> {
    // Read the registered push notification details, from the browser/cookie.
    let (vapid_signature, subscription_info) = match build_vapid_signature(cookies) {
        Ok(sig) => sig,
        Err(status_code) => return Ok(status_code),
    };

    // Now add payload and encrypt.
    let message = match build_web_push_message(
        vapid_signature,
        subscription_info,
        Notification {
            title: "Hello, world!".to_string(),
            message: "This notification was sent using the push API.".to_string(),
            icon: "https://cdn.jsdelivr.net/gh/twitter/twemoji@v14.0.2/assets/72x72/1f514.png"
                .to_string(),
            link: "https://demo.push-notifications.app?notification_clicked=true".to_string(),
            button_link: "https://github.com/tix-factory/push-notifications/issues".to_string(),
            buttons: ["🐛 File Bug".to_string()],
        },
    ) {
        Ok(m) => m,
        Err(status_code) => return Ok(status_code),
    };

    // Finally, send the notification!
    match IsahcWebPushClient::new() {
        Ok(client) => match client.send(message).await {
            Ok(_) => Ok(StatusCode::NO_CONTENT),
            Err(e) => {
                println!("Failed to send push notification: {}", e.to_string());
                Ok(StatusCode::INTERNAL_SERVER_ERROR)
            }
        },
        Err(e) => {
            println!("Failed to build push client: {}", e.to_string());
            Ok(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Builds the VAPID signature used to send the push notification.
fn build_vapid_signature(
    cookies: CookieJar,
) -> Result<(VapidSignature, SubscriptionInfo), StatusCode> {
    // Parse cookie for subscription information
    let subscription_info = match fetch(cookies) {
        Ok(cookie) => SubscriptionInfo::new(cookie.sub, cookie.p256dh, cookie.auth),
        Err(_) => return Err(StatusCode::UNAUTHORIZED),
    };

    // Create the signature builder
    let mut sig_builder = match env::var("VAPID__PRIVATE_KEY") {
        Ok(raw_private_key) => {
            match VapidSignatureBuilder::from_pem(raw_private_key.as_bytes(), &subscription_info) {
                Ok(sig) => sig,
                Err(e) => {
                    println!("Failed to build VAPID signature builder: {}", e.to_string());
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                }
            }
        }
        Err(_) => {
            println!("VAPID__PRIVATE_KEY is not set.");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    // Add VAPID claims
    sig_builder.add_claim("sub", format!("mailto:{}", EMAIL_ADDRESS.to_string()));

    // Return the signature itself
    match sig_builder.build() {
        Ok(sig) => Ok((sig, subscription_info)),
        Err(e) => {
            println!("Failed to build VAPID signature builder: {}", e.to_string());
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// Builds the web push notification/message.
fn build_web_push_message(
    vapid_signature: VapidSignature,
    subscription_info: SubscriptionInfo,
    notification: Notification,
) -> Result<WebPushMessage, StatusCode> {
    let web_push_message = match serde_json::to_string(&notification) {
        Ok(json) => {
            let mut builder = WebPushMessageBuilder::new(&subscription_info);
            builder.set_payload(ContentEncoding::Aes128Gcm, json.as_bytes());
            builder.set_vapid_signature(vapid_signature);
            builder.build()
        }
        Err(e) => {
            println!("Failed to serialize notification: {}", e.to_string());
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    match web_push_message {
        Ok(message) => Ok(message),
        Err(e) => {
            println!("Failed to build push notification: {}", e.to_string());
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
