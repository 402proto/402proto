"""provider registry. resolves `<provider>.<method>` to a concrete endpoint."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Endpoint:
    provider: str
    method: str
    url: str


# v0.1 hard-coded catalog. v0.2 will swap this for the on-chain registry.
CATALOG: dict[tuple[str, str], str] = {
    ("pyth.oracle", "price.get"):           "https://api.pyth.example.com/v1/price.get",
    ("jupiter.quote", "quote"):             "https://api.jupiter.example.com/v1/quote",
    ("jupiter.quote", "swap.build"):        "https://api.jupiter.example.com/v1/swap.build",
    ("birdeye.token", "token.meta"):        "https://api.birdeye.example.com/v1/token.meta",
    ("birdeye.token", "token.holders"):     "https://api.birdeye.example.com/v1/token.holders",
    ("helius.rpc", "getAccountInfo"):       "https://rpc.helius.example.com",
    ("helius.rpc", "sendTransaction"):      "https://rpc.helius.example.com",
    ("claude.completion", "messages.create"): "https://api.anthropic.example.com/v1/messages",
    ("anthropic.embed", "embeddings"):      "https://api.anthropic.example.com/v1/embeddings",
}


def resolve(provider: str, method: str) -> Endpoint:
    """resolve a provider+method pair to a concrete endpoint."""
    url = CATALOG.get((provider, method))
    if url is None:
        raise KeyError(f"unknown provider/method: {provider}.{method}")
    return Endpoint(provider=provider, method=method, url=url)


def list_providers() -> list[str]:
    return sorted({p for p, _ in CATALOG.keys()})


def list_methods(provider: str) -> list[str]:
    return sorted([m for p, m in CATALOG.keys() if p == provider])
