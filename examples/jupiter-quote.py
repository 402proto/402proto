"""fetch a jupiter swap quote, settle per-call."""
from __future__ import annotations

import os

from proto402 import Client


def main() -> None:
    wallet = os.environ.get("PROTO402_WALLET")
    if not wallet:
        raise SystemExit("PROTO402_WALLET is required")

    client = Client(wallet=wallet, cap="5 USDC/day")

    quote = client.call(
        provider="jupiter.quote",
        method="quote",
        params={
            "input": "So11111111111111111111111111111111111111112",
            "output": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            "amount": 1_000_000,
        },
        max_price=0.01,
    )

    print(f"jupiter quote: {quote.payload}")


if __name__ == "__main__":
    main()
