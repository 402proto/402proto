"""envelope: build canonical body, parse 402 response headers."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

SPEC_VERSION = "0.1"


@dataclass
class Envelope:
    """request side of the 402proto envelope."""

    version: str
    client: str
    wallet: str
    max_price: Optional[float] = None
    idempotency_key: Optional[str] = None

    def to_headers(self) -> dict[str, str]:
        h = {
            "x-402proto-version": self.version,
            "x-402proto-client": self.client,
            "x-402proto-wallet": self.wallet,
        }
        if self.max_price is not None:
            h["x-402proto-max-price"] = format(self.max_price, "f").rstrip("0").rstrip(".") or "0"
        if self.idempotency_key is not None:
            h["x-402proto-idempotency-key"] = self.idempotency_key
        return h


@dataclass
class CanonicalBody:
    """exactly the bytes signed by the wallet over a 402proto quote."""

    provider: str
    method: str
    price: str
    currency: str
    recipient: str
    chain: str
    quote_id: str
    nonce: str
    wallet: str
    ttl_expires_at: int

    def serialize(self) -> bytes:
        lines = [
            f"402proto/{SPEC_VERSION}",
            f"provider={self.provider}",
            f"method={self.method}",
            f"price={self.price}",
            f"currency={self.currency}",
            f"recipient={self.recipient}",
            f"chain={self.chain}",
            f"quote_id={self.quote_id}",
            f"nonce={self.nonce}",
            f"wallet={self.wallet}",
            f"ttl_expires_at={self.ttl_expires_at}",
        ]
        return "\n".join(lines).encode("utf-8")


@dataclass
class Quote402:
    """parsed 402 response headers from a provider."""

    version: str
    provider: str
    method: str
    price: float
    currency: str
    recipient: str
    ttl_seconds: int
    chain: str
    quote_id: str
    nonce: str


def parse_402_headers(headers: dict[str, str]) -> Quote402:
    """parse a provider's http 402 response. raises BadEnvelope on missing/malformed headers."""
    from proto402.errors import BadEnvelope

    required = [
        "x-402proto-version", "x-402proto-provider", "x-402proto-method",
        "x-402proto-price", "x-402proto-currency", "x-402proto-recipient",
        "x-402proto-ttl", "x-402proto-chain", "x-402proto-quote-id",
        "x-402proto-nonce",
    ]
    lower = {k.lower(): v for k, v in headers.items()}
    missing = [h for h in required if h not in lower]
    if missing:
        raise BadEnvelope(f"missing required headers: {missing}")

    try:
        return Quote402(
            version=lower["x-402proto-version"],
            provider=lower["x-402proto-provider"],
            method=lower["x-402proto-method"],
            price=float(lower["x-402proto-price"]),
            currency=lower["x-402proto-currency"],
            recipient=lower["x-402proto-recipient"],
            ttl_seconds=int(lower["x-402proto-ttl"]),
            chain=lower["x-402proto-chain"],
            quote_id=lower["x-402proto-quote-id"],
            nonce=lower["x-402proto-nonce"],
        )
    except (ValueError, KeyError) as e:
        raise BadEnvelope(f"malformed envelope: {e}") from e
