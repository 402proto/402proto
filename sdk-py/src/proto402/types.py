"""shared types for 402proto."""
from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class Receipt(BaseModel):
    """on-chain settlement receipt."""

    tx_signature: str = Field(description="base58 solana transaction signature")
    block_time: Optional[int] = Field(default=None, description="unix seconds, set after confirmation")
    spent_usdc: float = Field(description="amount actually transferred in usdc")
    recipient: str = Field(description="base58 pubkey of receiving ata owner")
    quote_id: str


class Quote(BaseModel):
    """response from a settled 402proto call."""

    provider: str
    method: str
    quote_id: str
    price_usdc: float
    payload: Any = Field(description="provider response body, parsed json")
    tx_signature: str = Field(description="base58 solana tx that settled the call")
    received_at: int = Field(description="unix seconds when payload returned")
    latency_ms: int

    @property
    def receipt(self) -> Receipt:
        return Receipt(
            tx_signature=self.tx_signature,
            spent_usdc=self.price_usdc,
            recipient="",  # populated when fetched from chain
            quote_id=self.quote_id,
        )
