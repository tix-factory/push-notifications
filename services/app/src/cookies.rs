use std::env;
use axum_extra::extract::{cookie::Cookie, CookieJar};
use serde::{Deserialize, Serialize};
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};

const AUTH_COOKIE_NAME: &str = "auth_token";

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthCookie {
    /// The endpoint to send the notification to.
    pub sub: String,

    /// The (base64 encoded) public key the push subscription is subscribed with.
    pub p256dh: String,

    /// The (base64 encoded) authentication secret for the push subscription.
    pub auth: String,

    /// The cookie expiration.
    pub exp: usize,
}

/// Fetches the authentication details from the cookie jar.
pub fn fetch(cookies: CookieJar) -> Result<AuthCookie, String> {
    let cookie = match cookies.get(AUTH_COOKIE_NAME) {
        Some(cookie) => cookie.value(),
        None => return Err("Authentication cookie is not set".to_string())
    };
    
    match decode::<AuthCookie>(cookie, &jwt_public_key(), &Validation::new(Algorithm::RS256)) {
        Ok(auth) => Ok(auth.claims),
        Err(e) => Err(e.to_string())
    }
}

/// Authenticates the cookie jar with a JWT.
pub fn authenticate(cookies: CookieJar, auth_cookie: AuthCookie) -> CookieJar {
    let token = encode(&Header::new(Algorithm::RS256), &auth_cookie, &jwt_private_key()).expect("Failed to encode JWT");
    let cookie = Cookie::build((AUTH_COOKIE_NAME, token))
        .path("/")
        .max_age(time::Duration::days(7))
        .build();
    cookies.add(cookie)
}

/// Removes the authentication cookie from the cookie jar.
pub fn clear(cookies: CookieJar) -> CookieJar {
    let cookie = Cookie::build((AUTH_COOKIE_NAME, ""))
        .path("/")
        .max_age(time::Duration::ZERO)
        .build();
    cookies.remove(cookie)
}

/// Reads the `JWT__PRIVATE_KEY` PEM from the environment variables.
fn jwt_private_key() -> EncodingKey {
    let raw_private_key = env::var("JWT__PRIVATE_KEY").expect("JWT__PRIVATE_KEY is not set.");
    EncodingKey::from_rsa_pem(raw_private_key.as_bytes()).expect("Failed to parse JWT__PRIVATE_KEY")
}

/// Reads the `JWT_PUBLIC_KEY` PEM from the environment variables.
fn jwt_public_key() -> DecodingKey {
    let raw_public_key = env::var("JWT__PUBLIC_KEY").expect("JWT__PUBLIC_KEY is not set.");
    DecodingKey::from_rsa_pem(raw_public_key.as_bytes()).expect("Failed to parse JWT__PUBLIC_KEY")
}