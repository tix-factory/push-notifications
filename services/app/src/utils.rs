use std::env;
use std::sync::LazyLock;
use jsonwebtoken::EncodingKey;
use p256::pkcs8::DecodePublicKey;
use p256::{PublicKey};

/// Reads the `VAPID__EMAIL_ADDRESS` from the environment variables.
pub static EMAIL_ADDRESS: LazyLock<String> = LazyLock::new(|| {
    env::var("VAPID__EMAIL_ADDRESS").expect("VAPID__EMAIL_ADDRESS is not set.")
});

/// Reads the `VAPID__PUBLIC_KEY` PEM from the environment variables.
pub static VAPID_PUBLIC_KEY: LazyLock<PublicKey> = LazyLock::new(|| {
    let raw_public_key = env::var("VAPID__PUBLIC_KEY").expect("VAPID__PUBLIC_KEY is not set.");
    PublicKey::from_public_key_pem(&raw_public_key).expect("VAPID__PUBLIC_KEY (PEM) is not set.")
});

/// Reads the `JWT__PRIVATE_KEY` PEM from the environment variables.
pub static JWT_PRIVATE_KEY: LazyLock<EncodingKey> = LazyLock::new(|| {
    let raw_private_key = env::var("JWT__PRIVATE_KEY").expect("JWT__PRIVATE_KEY is not set.");
    EncodingKey::from_rsa_pem(raw_private_key.as_bytes()).expect("Failed to parse JWT__PRIVATE_KEY")
});
