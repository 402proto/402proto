"""ed25519 signing tests."""
from __future__ import annotations

from nacl.signing import SigningKey

from proto402.signing import derive_pubkey, sign, verify


def _fresh_keypair() -> tuple[bytes, str]:
    sk = SigningKey.generate()
    return bytes(sk), derive_pubkey(bytes(sk))


def test_sign_and_verify_roundtrip():
    secret, pubkey = _fresh_keypair()
    body = b"402proto/0.1\nprovider=pyth.oracle\nprice=0.001"
    sig = sign(body, secret)
    assert verify(body, sig, pubkey)


def test_verify_rejects_modified_body():
    secret, pubkey = _fresh_keypair()
    body = b"402proto/0.1\nprovider=pyth.oracle"
    sig = sign(body, secret)
    tampered = body + b"\nprice=99999"
    assert not verify(tampered, sig, pubkey)


def test_verify_rejects_wrong_pubkey():
    secret_a, _ = _fresh_keypair()
    _, pubkey_b = _fresh_keypair()
    body = b"402proto/0.1"
    sig = sign(body, secret_a)
    assert not verify(body, sig, pubkey_b)


def test_derive_pubkey_is_deterministic():
    secret, pubkey = _fresh_keypair()
    again = derive_pubkey(secret)
    assert pubkey == again
