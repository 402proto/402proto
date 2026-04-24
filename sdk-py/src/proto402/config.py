"""client config via env / .env."""
from __future__ import annotations

from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """402proto client configuration.

    every field can be set via env (`PROTO402_*`) or pass-through to Client(...).
    """

    wallet: Optional[str] = None
    rpc_url: str = "https://api.mainnet-beta.solana.com"
    network: str = "mainnet"
    cap_daily_usdc: Optional[float] = None
    spec_version: str = "0.1"
    timeout_seconds: float = 30.0
    retry_attempts: int = 3

    model_config = SettingsConfigDict(
        env_prefix="PROTO402_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
