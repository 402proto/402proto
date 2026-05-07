"""minimal agent loop: read a price, summarize via claude, settle both.

every call goes through pay-per-use; the fleet has a hard daily usdc cap.
"""
from __future__ import annotations

import os

from proto402 import Client


def main() -> None:
    wallet = os.environ.get("PROTO402_WALLET")
    if not wallet:
        raise SystemExit("PROTO402_WALLET is required")

    client = Client(wallet=wallet, cap="2 USDC/day")

    price = client.call(
        provider="pyth.oracle",
        method="price.get",
        params={"symbol": "SOL/USD"},
        max_price=0.005,
    )
    print(f"pyth quote settled: {price.tx_signature[:12]}...")

    summary = client.call(
        provider="claude.completion",
        method="messages.create",
        params={
            "model": "claude-3-7-sonnet",
            "prompt": f"summarize this price for a slack channel: {price.payload}",
        },
        max_price=0.05,
    )
    print(f"claude reply: {summary.payload}")
    print(f"both settled. daily spend so far: ~{(price.price_usdc + summary.price_usdc):.4f} USDC")


if __name__ == "__main__":
    main()
