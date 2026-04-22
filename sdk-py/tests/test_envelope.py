"""envelope unit tests."""
from __future__ import annotations

import pytest

from proto402.envelope import CanonicalBody, Envelope, parse_402_headers
from proto402.errors import BadEnvelope


def test_envelope_basic_headers():
    e = Envelope(version="0.1", client="proto402-py/0.1.0", wallet="7xKp")
    h = e.to_headers()
    assert h["x-402proto-version"] == "0.1"
    assert h["x-402proto-client"] == "proto402-py/0.1.0"
    assert h["x-402proto-wallet"] == "7xKp"
    assert "x-402proto-max-price" not in h


def test_envelope_with_max_price():
    e = Envelope(version="0.1", client="x", wallet="w", max_price=0.005)
    h = e.to_headers()
    # decimal formatted, no scientific notation
    assert h["x-402proto-max-price"] == "0.005000"


def test_canonical_body_is_deterministic():
    cb = CanonicalBody(
        provider="pyth.oracle",
        method="price.get",
        price="0.001",
        currency="USDC",
        recipient="7xKpRECIP",
        chain="solana-mainnet",
        quote_id="q_test",
        nonce="abc123",
        wallet="7xKpWALLET",
        ttl_expires_at=1747066412,
    )
    body = cb.serialize()
    assert body.startswith(b"402proto/0.1\n")
    # exactly 11 lines in v0.1
    assert body.count(b"\n") == 10
    # no trailing newline
    assert not body.endswith(b"\n")


def test_canonical_body_field_order_is_stable():
    cb = CanonicalBody(
        provider="a", method="b", price="0", currency="USDC",
        recipient="r", chain="solana-devnet", quote_id="q",
        nonce="n", wallet="w", ttl_expires_at=1,
    )
    lines = cb.serialize().decode().split("\n")
    assert lines[0] == "402proto/0.1"
    assert lines[1].startswith("provider=")
    assert lines[2].startswith("method=")
    assert lines[3].startswith("price=")
    assert lines[10].startswith("ttl_expires_at=")


def test_parse_402_headers_complete():
    headers = {
        "x-402proto-version": "0.1",
        "x-402proto-provider": "pyth.oracle",
        "x-402proto-method": "price.get",
        "x-402proto-price": "0.001",
        "x-402proto-currency": "USDC",
        "x-402proto-recipient": "7xKp",
        "x-402proto-ttl": "12",
        "x-402proto-chain": "solana-mainnet",
        "x-402proto-quote-id": "q1",
        "x-402proto-nonce": "n1",
    }
    q = parse_402_headers(headers)
    assert q.price == pytest.approx(0.001)
    assert q.ttl_seconds == 12
    assert q.provider == "pyth.oracle"


def test_parse_402_headers_missing_required():
    headers = {"x-402proto-version": "0.1"}
    with pytest.raises(BadEnvelope):
        parse_402_headers(headers)


def test_parse_402_headers_case_insensitive():
    headers = {
        "X-402proto-Version": "0.1",
        "X-402proto-Provider": "pyth.oracle",
        "x-402proto-method": "price.get",
        "X-402PROTO-PRICE": "0.001",
        "x-402proto-currency": "USDC",
        "x-402proto-recipient": "r",
        "x-402proto-ttl": "12",
        "x-402proto-chain": "solana-mainnet",
        "x-402proto-quote-id": "q",
        "x-402proto-nonce": "n",
    }
    q = parse_402_headers(headers)
    assert q.provider == "pyth.oracle"
