//! ed25519 verification of 402proto canonical bodies.

use ed25519_dalek::{Signature, Verifier, VerifyingKey};

/// verify a base58-encoded ed25519 signature over `canonical_body` for `pubkey_b58`.
pub fn verify(canonical_body: &[u8], signature_b58: &str, pubkey_b58: &str) -> bool {
    let Ok(sig_bytes) = bs58::decode(signature_b58).into_vec() else { return false };
    let Ok(pk_bytes) = bs58::decode(pubkey_b58).into_vec() else { return false };
    let Ok(sig_arr): Result<[u8; 64], _> = sig_bytes.as_slice().try_into() else { return false };
    let Ok(pk_arr): Result<[u8; 32], _> = pk_bytes.as_slice().try_into() else { return false };
    let Ok(vk) = VerifyingKey::from_bytes(&pk_arr) else { return false };
    let sig = Signature::from_bytes(&sig_arr);
    vk.verify(canonical_body, &sig).is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};
    use rand::rngs::OsRng;

    fn fresh_pair() -> (SigningKey, String) {
        let sk = SigningKey::generate(&mut OsRng);
        let pk_b58 = bs58::encode(sk.verifying_key().as_bytes()).into_string();
        (sk, pk_b58)
    }

    #[test]
    fn verify_roundtrip() {
        let (sk, pk) = fresh_pair();
        let body = b"402proto/0.1\nprovider=pyth.oracle";
        let sig = sk.sign(body);
        let sig_b58 = bs58::encode(sig.to_bytes()).into_string();
        assert!(verify(body, &sig_b58, &pk));
    }

    #[test]
    fn rejects_tampered() {
        let (sk, pk) = fresh_pair();
        let body = b"402proto/0.1";
        let sig = sk.sign(body);
        let sig_b58 = bs58::encode(sig.to_bytes()).into_string();
        assert!(!verify(b"402proto/0.2", &sig_b58, &pk));
    }

    #[test]
    fn rejects_garbage_signature() {
        let (_, pk) = fresh_pair();
        assert!(!verify(b"x", "not-base58!!!", &pk));
    }
}
