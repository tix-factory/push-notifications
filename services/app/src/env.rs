use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use p256::pkcs8::DecodePublicKey;
use p256::PublicKey;
use std::env;
use std::sync::LazyLock;

/// Reads the `JWT__PUBLIC_KEY` from the environment variables.
pub static JWT_PUBLIC_KEY: LazyLock<String> =
    LazyLock::new(|| env::var("JWT__PUBLIC_KEY").expect("JWT__PUBLIC_KEY is not set."));

/// Reads the `JWT__PRIVATE_KEY` from the environment variables.
pub static JWT_PRIVATE_KEY: LazyLock<String> =
    LazyLock::new(|| env::var("JWT__PRIVATE_KEY").expect("JWT__PRIVATE_KEY is not set."));

/// Reads the `VAPID__EMAIL_ADDRESS` from the environment variables.
pub static EMAIL_ADDRESS: LazyLock<String> =
    LazyLock::new(|| env::var("VAPID__EMAIL_ADDRESS").expect("VAPID__EMAIL_ADDRESS is not set."));

/// Reads the `VAPID__PUBLIC_KEY` PEM from the environment variables.
pub static VAPID_PUBLIC_KEY: LazyLock<String> = LazyLock::new(|| {
    let raw_public_key = env::var("VAPID__PUBLIC_KEY").expect("VAPID__PUBLIC_KEY is not set.");
    let public_key = PublicKey::from_public_key_pem(&raw_public_key)
        .expect("VAPID__PUBLIC_KEY (PEM) is not set.");
    URL_SAFE_NO_PAD.encode(public_key.to_sec1_bytes())
});

/// Reads the `VAPID__PRIVATE_KEY` PEM from the environment variables.
pub static VAPID_PRIVATE_KEY: LazyLock<String> =
    LazyLock::new(|| env::var("VAPID__PRIVATE_KEY").expect("VAPID__PRIVATE_KEY is not set."));
