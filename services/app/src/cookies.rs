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
        Err(e) => Err(format!("Failed to encode JWT: {}", e)),
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
#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use openssl::pkey::PKey;
    use openssl::rsa::Rsa;
    use std::env;

    #[test]
    fn test_clear() {
        let cookies = clear(
            CookieJar::new()
                .add(Cookie::new("foo", "bar"))
                .add(Cookie::new("a", "b"))
                .add(Cookie::new(AUTH_COOKIE_NAME, "hello_world")),
        );

        assert_eq!(serialize(cookies, false), "a=b, foo=bar");
    }

    #[test]
    fn test_authenticate() {
        let exp = (Utc::now().timestamp() + 15) as usize;
        let rsa = Rsa::generate(2048).unwrap();
        let key = PKey::from_rsa(rsa).unwrap();
        env::set_var(
            "JWT__PRIVATE_KEY",
            String::from_utf8(key.private_key_to_pem_pkcs8().unwrap()).unwrap(),
        );
        env::set_var(
            "JWT__PUBLIC_KEY",
            String::from_utf8(key.public_key_to_pem().unwrap()).unwrap(),
        );

        let cookies = authenticate(
            CookieJar::new()
                .add(Cookie::new("foo", "bar"))
                .add(Cookie::new("a", "b")),
            AuthCookie {
                exp,
                sub: "hello".to_string(),
                p256dh: "world".to_string(),
                auth: "foo".to_string(),
            },
        )
        .unwrap();

        let cookie = fetch(cookies.clone()).unwrap();
        assert_eq!(cookie.exp, exp, "exp didn't match");
        assert_eq!(cookie.sub, "hello", "sub didn't match");
        assert_eq!(cookie.p256dh, "world", "p256dh didn't match");
        assert_eq!(cookie.auth, "foo", "auth didn't match");
        assert_eq!(
            serialize(cookies, true),
            "a, auth_token, foo",
            "CookieJar didn't match"
        );

        // Test cleanup, to not impact other tests
        env::remove_var("JWT__PRIVATE_KEY");
        env::remove_var("JWT__PUBLIC_KEY");
    }

    #[test]
    #[should_panic(expected = "JWT__PRIVATE_KEY is not set.")]
    fn test_authenticate_no_jwt_private_key() {
        let _ = authenticate(
            CookieJar::new()
                .add(Cookie::new("foo", "bar"))
                .add(Cookie::new("a", "b")),
            AuthCookie {
                exp: (Utc::now().timestamp() + 15) as usize,
                sub: "hello".to_string(),
                p256dh: "world".to_string(),
                auth: "foo".to_string(),
            },
        )
        .unwrap();
    }

    #[test]
    #[should_panic(expected = "Authentication cookie is not set")]
    fn test_fetch_no_cookie() {
        let cookies = CookieJar::new()
            .add(Cookie::new("foo", "bar"))
            .add(Cookie::new("a", "b"));
        let _ = fetch(cookies).unwrap();
    }

    #[test]
    #[should_panic(expected = "JWT__PUBLIC_KEY is not set.")]
    fn test_fetch_no_jwt_public_key() {
        let cookies = CookieJar::new()
            .add(Cookie::new("foo", "bar"))
            .add(Cookie::new("a", "b"))
            .add(Cookie::new(AUTH_COOKIE_NAME, "fake"));
        let _ = fetch(cookies).unwrap();
    }

    fn serialize(cookies: CookieJar, keys_only: bool) -> String {
        let mut remaining_cookies = cookies
            .iter()
            .map(|c| match keys_only {
                true => c.name().to_string(),
                false => c.to_string(),
            })
            .collect::<Vec<String>>();
        remaining_cookies.sort();
        remaining_cookies.join(", ")
    }
}
