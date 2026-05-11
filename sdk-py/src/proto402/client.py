"""high-level Client api.

entry point for everything an agent does with 402proto.
"""
from __future__ import annotations

import json
import time
from typing import Any, Optional

import httpx
import structlog

from proto402.config import Settings
from proto402.envelope import SPEC_VERSION, CanonicalBody, Envelope, parse_402_headers
from proto402.errors import CapExceeded, from_code
from proto402.types import Quote

log = structlog.get_logger(__name__)

USER_AGENT = "proto402-py/0.1.0 (+https://402proto.xyz)"


class Client:
    """402proto python client.

    instantiate with a wallet, then call `.call(provider=..., method=..., params=...)`.
    """

    def __init__(
        self,
        wallet: str,
        *,
        cap: Optional[str] = None,
        rpc_url: Optional[str] = None,
        network: Optional[str] = None,
        timeout: float = 30.0,
    ):
        cfg = Settings()
        self.wallet_secret = wallet or cfg.wallet
        if not self.wallet_secret:
            raise ValueError(
                "wallet is required. pass `Client(wallet=...)` or set PROTO402_WALLET."
            )
        self.rpc_url = rpc_url or cfg.rpc_url
        self.network = network or cfg.network
        self.timeout = timeout
        self.cap_daily = self._parse_cap(cap or "")
        self._spent_today = 0.0

    @staticmethod
    def _parse_cap(cap: str) -> Optional[float]:
        # "10 USDC/day", "5", "$25"
        if not cap:
            return None
        s = cap.lower().strip().replace("$", "").replace("usdc", "").strip()
        # drop trailing "/day", "/d", etc — daily is the only supported window in v0.1
        for suffix in ("/day", "/d", "per day"):
            if s.endswith(suffix):
                s = s[: -len(suffix)].strip()
                break
        try:
            return float(s)
        except ValueError:
            return None

    def call(
        self,
        *,
        provider: str,
        method: str,
        params: Optional[dict[str, Any]] = None,
        max_price: Optional[float] = None,
    ) -> Quote:
        """perform a paid api call.

        flow:
            1. GET <provider/method> with envelope headers
            2. receive 402 + quote
            3. cap check
            4. settle on-chain (mocked in this stub)
            5. retry with proof headers
            6. return Quote
        """
        from proto402.providers import resolve

        endpoint = resolve(provider, method)
        envelope = Envelope(
            version=SPEC_VERSION,
            client=USER_AGENT,
            wallet=self._derive_pubkey(),
            max_price=max_price,
        )
        params = params or {}

        with httpx.Client(timeout=self.timeout) as http:
            t0 = time.time()
            r = http.post(endpoint.url, json=params, headers=envelope.to_headers())

            if r.status_code != 402:
                raise from_code(
                    r.headers.get("x-402proto-error", "provider-error"),
                    f"unexpected status {r.status_code}",
                )

            quote = parse_402_headers(dict(r.headers))

            if max_price is not None and quote.price > max_price:
                raise CapExceeded(
                    f"quote {quote.price} exceeds max {max_price}"
                )
            if self.cap_daily is not None and (
                self._spent_today + quote.price > self.cap_daily
            ):
                raise CapExceeded(
                    f"would exceed daily cap of {self.cap_daily} USDC"
                )

            # build canonical body, sign, settle on-chain (mocked here)
            ttl_expires_at = int(time.time() + quote.ttl_seconds)
            cb = CanonicalBody(
                provider=quote.provider,
                method=quote.method,
                price=str(quote.price),
                currency=quote.currency,
                recipient=quote.recipient,
                chain=quote.chain,
                quote_id=quote.quote_id,
                nonce=quote.nonce,
                wallet=envelope.wallet,
                ttl_expires_at=ttl_expires_at,
            )
            sig = self._sign(cb.serialize())
            tx_sig = self._settle(cb)

            # retry with proof
            r2 = http.post(
                endpoint.url,
                json=params,
                headers={
                    **envelope.to_headers(),
                    "x-402proto-quote-id": quote.quote_id,
                    "x-402proto-expires": str(ttl_expires_at),
                    "x-402proto-receipt": tx_sig,
                    "x-402proto-signature": sig,
                },
            )

            if r2.status_code != 200:
                raise from_code(
                    r2.headers.get("x-402proto-error", "provider-error"),
                    r2.text[:200],
                )

            self._spent_today += quote.price
            payload = r2.json() if r2.headers.get("content-type", "").startswith(
                "application/json"
            ) else r2.text
            latency_ms = int((time.time() - t0) * 1000)

            return Quote(
                provider=quote.provider,
                method=quote.method,
                quote_id=quote.quote_id,
                price_usdc=quote.price,
                payload=payload,
                tx_signature=tx_sig,
                received_at=int(time.time()),
                latency_ms=latency_ms,
            )

    def _derive_pubkey(self) -> str:
        from proto402.signing import derive_pubkey
        # in v0.1 wallet is the secret-key base58 directly; v0.2 supports keypair files
        secret = _decode_secret(self.wallet_secret)
        return derive_pubkey(secret)

    def _sign(self, body: bytes) -> str:
        from proto402.signing import sign
        secret = _decode_secret(self.wallet_secret)
        return sign(body, secret)

    def _settle(self, cb: CanonicalBody) -> str:
        """submit the on-chain usdc transfer. returns base58 tx signature."""
        from proto402.settle import submit_transfer
        return submit_transfer(
            rpc_url=self.rpc_url,
            network=self.network,
            wallet_secret=_decode_secret(self.wallet_secret),
            recipient=cb.recipient,
            amount_usdc=float(cb.price),
            memo=f"402proto/0.1 q={cb.quote_id}",
        )


def _decode_secret(s: str) -> bytes:
    import based58
    return based58.b58decode(s.encode("ascii"))
