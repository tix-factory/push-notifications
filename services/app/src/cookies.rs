use crate::env::{JWT_PRIVATE_KEY, JWT_PUBLIC_KEY};
use axum_extra::extract::{cookie::Cookie, CookieJar};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

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
        None => return Err("Authentication cookie is not set".to_string()),
    };

    let public_key = match DecodingKey::from_rsa_pem(JWT_PUBLIC_KEY.as_bytes()) {
        Ok(key) => key,
        Err(e) => return Err(e.to_string()),
    };

    match decode::<AuthCookie>(cookie, &public_key, &Validation::new(Algorithm::RS256)) {
        Ok(auth) => Ok(auth.claims),
        Err(e) => Err(e.to_string()),
    }
}

/// Authenticates the cookie jar with a JWT.
pub fn authenticate(cookies: CookieJar, auth_cookie: AuthCookie) -> Result<CookieJar, String> {
    let private_key = match EncodingKey::from_rsa_pem(JWT_PRIVATE_KEY.as_bytes()) {
        Ok(key) => key,
        Err(e) => return Err(e.to_string()),
    };

    match encode(&Header::new(Algorithm::RS256), &auth_cookie, &private_key) {
        Ok(token) => {
            let cookie = Cookie::build((AUTH_COOKIE_NAME, token))
                .path("/")
                .max_age(time::Duration::days(7))
                .build();
            Ok(cookies.add(cookie))
        }
        Err(e) => Err(format!("Failed to encode JWT: {}", e.to_string())),
    }
}

/// Removes the authentication cookie from the cookie jar.
pub fn clear(cookies: CookieJar) -> CookieJar {
    let cookie = Cookie::build((AUTH_COOKIE_NAME, ""))
        .path("/")
        .max_age(time::Duration::ZERO)
        .build();
    cookies.remove(cookie)
}
