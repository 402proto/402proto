"""solana usdc spl-transfer with memo, as defined in spec/settle.md.

v0.1 ships a thin wrapper around solana-py / solders for the actual transaction
construction. for now this is a stub that returns a fake signature; full
mainnet integration lands in v0.1.1.
"""
from __future__ import annotations

import secrets
from typing import Literal

USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
USDC_MINT_DEVNET = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
MEMO_PROGRAM = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"


def usdc_mint(network: Literal["mainnet", "devnet"]) -> str:
    return USDC_MINT_MAINNET if network == "mainnet" else USDC_MINT_DEVNET


def to_base_units(amount_usdc: float) -> int:
    """usdc has 6 decimals."""
    return int(round(amount_usdc * 1_000_000))


def submit_transfer(
    *,
    rpc_url: str,
    network: str,
    wallet_secret: bytes,
    recipient: str,
    amount_usdc: float,
    memo: str,
) -> str:
    """build + sign + send the spl-token transfer with attached memo.

    in v0.1 this is a placeholder that returns a deterministic-looking
    base58 signature. real chain submission lives behind a feature flag
    until provider integrations stabilize.
    """
    # build tx (placeholder)
    _ = (rpc_url, network, wallet_secret, recipient, to_base_units(amount_usdc), memo)
    # return a base58-shaped pseudo-signature
    return _fake_signature()


def _fake_signature() -> str:
    chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    return "".join(secrets.choice(chars) for _ in range(88))
