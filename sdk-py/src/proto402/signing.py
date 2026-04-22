"""ed25519 signing helpers for 402proto."""
from __future__ import annotations

import based58
from nacl.signing import SigningKey, VerifyKey


def sign(canonical_body: bytes, secret_key_bytes: bytes) -> str:
    """sign canonical body. returns base58-encoded signature."""
    signer = SigningKey(secret_key_bytes[:32])
    sig = signer.sign(canonical_body).signature
    return based58.b58encode(sig).decode("ascii")


def verify(canonical_body: bytes, signature_b58: str, pubkey_b58: str) -> bool:
    """verify a 402proto signature. returns True on success, False otherwise."""
    from nacl.exceptions import BadSignatureError

    try:
        sig = based58.b58decode(signature_b58.encode("ascii"))
        pk = based58.b58decode(pubkey_b58.encode("ascii"))
        verifier = VerifyKey(pk)
        verifier.verify(canonical_body, sig)
        return True
    except (BadSignatureError, ValueError):
        return False


def derive_pubkey(secret_key_bytes: bytes) -> str:
    """derive base58 public key from ed25519 secret."""
    signer = SigningKey(secret_key_bytes[:32])
    return based58.b58encode(bytes(signer.verify_key)).decode("ascii")
