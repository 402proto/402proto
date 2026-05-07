"""minimal example: fetch a pyth price, settled in one usdc transfer.

run:
    export PROTO402_WALLET=<base58 secret key>
    python examples/pyth-price-feed.py
"""
from __future__ import annotations

import os

from proto402 import Client


def main() -> None:
    wallet = os.environ.get("PROTO402_WALLET")
    if not wallet:
        raise SystemExit("PROTO402_WALLET is required")

    client = Client(wallet=wallet, cap="1 USDC/day")

    quote = client.call(
        provider="pyth.oracle",
        method="price.get",
        params={"symbol": "SOL/USD"},
        max_price=0.005,
    )

    print(f"SOL/USD: {quote.payload}")
    print(f"settled in tx: {quote.tx_signature[:12]}...")
    print(f"spent: {quote.price_usdc} USDC")


if __name__ == "__main__":
    main()
