"""402proto python client.

open payment protocol for paid apis. agents quote, sign, settle in usdc on solana.

basic usage:

    from proto402 import Client

    client = Client(wallet=..., cap="10 USDC/day")
    quote = client.call(provider="pyth.oracle", method="price.get",
                        params={"symbol": "SOL/USD"}, max_price=0.005)
    print(quote.payload, quote.tx_signature)
"""
from proto402.client import Client
from proto402.envelope import CanonicalBody, Envelope
from proto402.errors import (
    BadEnvelope,
    CapExceeded,
    Proto402Error,
    ProofMissing,
    QuoteExpired,
    SignatureInvalid,
)
from proto402.types import Quote, Receipt

__version__ = "0.1.0"

__all__ = [
    "Client",
    "Quote",
    "Receipt",
    "Envelope",
    "CanonicalBody",
    "Proto402Error",
    "BadEnvelope",
    "QuoteExpired",
    "SignatureInvalid",
    "ProofMissing",
    "CapExceeded",
]
