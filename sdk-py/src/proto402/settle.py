"""solana usdc spl-transfer with memo, as defined in spec/settle.md.

v0.2: real on-chain submission via solders + solana-py. install chain
dependencies with `pip install 'proto402[chain]'`. without them the
client raises a clear error rather than silently returning a fake
signature (which v0.1 did).
"""
from __future__ import annotations

import logging
import secrets
from typing import Literal

logger = logging.getLogger(__name__)

USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
USDC_MINT_DEVNET = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
MEMO_PROGRAM = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"


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
    dry_run: bool = False,
    confirm: bool = True,
) -> str:
    """build, sign, and submit an spl-token usdc transfer with attached memo.

    returns the base58 transaction signature. when ``dry_run`` is True the tx
    is built and signed but not sent — useful for offline testing and CI.

    raises ``ChainDependencyMissing`` if the optional chain extras are not
    installed.
    """
    try:
        from solana.rpc.api import Client as SolanaRpc
        from solana.rpc.commitment import Confirmed
        from solana.rpc.types import TxOpts
        from solders.instruction import Instruction
        from solders.keypair import Keypair
        from solders.message import MessageV0
        from solders.pubkey import Pubkey
        from solders.transaction import VersionedTransaction
        from spl.token.instructions import (
            TransferCheckedParams,
            get_associated_token_address,
            transfer_checked as spl_transfer_checked,
        )
    except ImportError as e:
        raise ChainDependencyMissing(
            "settlement requires the chain extras. "
            "install with `pip install 'proto402[chain]'`."
        ) from e

    sender_kp = Keypair.from_bytes(wallet_secret)
    sender = sender_kp.pubkey()
    receiver = Pubkey.from_string(recipient)
    mint = Pubkey.from_string(usdc_mint(network))

    from_ata = get_associated_token_address(sender, mint)
    to_ata = get_associated_token_address(receiver, mint)

    transfer_ix = spl_transfer_checked(
        TransferCheckedParams(
            program_id=Pubkey.from_string(TOKEN_PROGRAM),
            source=from_ata,
            mint=mint,
            dest=to_ata,
            owner=sender,
            amount=to_base_units(amount_usdc),
            decimals=6,
        )
    )
    memo_ix = Instruction(
        program_id=Pubkey.from_string(MEMO_PROGRAM),
        accounts=[],
        data=memo.encode("utf-8"),
    )

    rpc = SolanaRpc(rpc_url)
    blockhash = rpc.get_latest_blockhash().value.blockhash
    msg = MessageV0.try_compile(
        payer=sender,
        instructions=[transfer_ix, memo_ix],
        address_lookup_table_accounts=[],
        recent_blockhash=blockhash,
    )
    tx = VersionedTransaction(msg, [sender_kp])
    sig = tx.signatures[0]

    if dry_run:
        logger.debug("dry_run: built + signed but not submitted; sig=%s", sig)
        return str(sig)

    rpc.send_transaction(tx, opts=TxOpts(skip_preflight=False, max_retries=3))
    if confirm:
        rpc.confirm_transaction(sig, commitment=Confirmed)
    return str(sig)


class ChainDependencyMissing(RuntimeError):
    """raised when solders/solana/spl-token are not installed."""


def _fake_signature() -> str:
    """deprecated. kept temporarily so legacy tests that import it still
    resolve — will be removed in v0.3. do NOT use in client code."""
    chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    return "".join(secrets.choice(chars) for _ in range(88))
