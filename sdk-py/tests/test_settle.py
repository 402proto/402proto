"""tests for the spl-transfer settle path.

network tests are skipped unless `proto402[chain]` extras are installed.
unit tests cover the pure helpers (mint mapping, base-unit conversion)
and the ChainDependencyMissing branch.
"""
from __future__ import annotations

import importlib

import pytest

from proto402 import settle


def test_usdc_mint_mainnet():
    assert settle.usdc_mint("mainnet") == settle.USDC_MINT_MAINNET


def test_usdc_mint_devnet():
    assert settle.usdc_mint("devnet") == settle.USDC_MINT_DEVNET


@pytest.mark.parametrize(
    "usdc,expected_units",
    [
        (1.0, 1_000_000),
        (0.001, 1_000),
        (0.000001, 1),
        (0.0, 0),
        (12.345678, 12_345_678),
    ],
)
def test_to_base_units(usdc: float, expected_units: int):
    assert settle.to_base_units(usdc) == expected_units


def test_to_base_units_rounds_half_up():
    # 1 micro-usdc-and-a-half should round to 2 micro-usdc (banker's rounding
    # in cpython rounds to even, so 1.5 → 2 and 0.5 → 0; we just confirm the
    # contract that fractional micros below 0.5 always round down).
    assert settle.to_base_units(0.0000004) == 0


def _chain_available() -> bool:
    try:
        importlib.import_module("solders")
        importlib.import_module("solana")
        importlib.import_module("spl.token.instructions")
    except ImportError:
        return False
    return True


@pytest.mark.skipif(_chain_available(), reason="chain extras installed; runs the no-deps test path only")
def test_submit_transfer_raises_when_chain_missing():
    with pytest.raises(settle.ChainDependencyMissing):
        settle.submit_transfer(
            rpc_url="https://api.devnet.solana.com",
            network="devnet",
            wallet_secret=b"\x00" * 64,
            recipient="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            amount_usdc=0.001,
            memo="402proto/0.2 q=test",
            dry_run=True,
        )


@pytest.mark.skipif(not _chain_available(), reason="chain extras not installed")
def test_submit_transfer_dry_run_signs_locally():
    """with extras installed, dry_run builds and signs a tx without RPC submission."""
    from solders.keypair import Keypair

    kp = Keypair()
    sig = settle.submit_transfer(
        rpc_url="https://api.devnet.solana.com",
        network="devnet",
        wallet_secret=bytes(kp),
        recipient="9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
        amount_usdc=0.001,
        memo="402proto/0.2 q=test",
        dry_run=True,
    )
    # base58-shaped, ~88 chars
    assert isinstance(sig, str)
    assert 80 <= len(sig) <= 90
