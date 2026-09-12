use p256::pkcs8::DecodePublicKey;
use p256::{PublicKey};
use worker::Env;

/// Reads the `VAPID__PUBLIC_KEY` PEM from the worker variables.
pub fn read_public_key(env: Env) -> PublicKey {
    let raw_public_key = env.var("VAPID__PUBLIC_KEY").expect("VAPID__PUBLIC_KEY is not set.").to_string();
    let public_key = PublicKey::from_public_key_pem(&raw_public_key);
    public_key.expect("VAPID__PUBLIC_KEY (PEM) is not set.")
}
