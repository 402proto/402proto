"""provider registry. resolves `<provider>.<method>` to a concrete endpoint."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Endpoint:
    provider: str
    method: str
    url: str


# v0.1 hard-coded catalog. v0.2 will swap this for the on-chain registry.
# entries marked CANDIDATE below are wired but disabled until the upstream
# provider implements the 402proto envelope. routers will refuse to route to
# them until their status is bumped to production.
CATALOG: dict[tuple[str, str], str] = {
    # === v0.1 production ===
    ("pyth.oracle", "price.get"):           "https://api.pyth.example.com/v1/price.get",
    ("jupiter.quote", "quote"):             "https://api.jupiter.example.com/v1/quote",
    ("jupiter.quote", "swap.build"):        "https://api.jupiter.example.com/v1/swap.build",
    ("birdeye.token", "token.meta"):        "https://api.birdeye.example.com/v1/token.meta",
    ("birdeye.token", "token.holders"):     "https://api.birdeye.example.com/v1/token.holders",
    ("helius.rpc", "getAccountInfo"):       "https://rpc.helius.example.com",
    ("helius.rpc", "sendTransaction"):      "https://rpc.helius.example.com",
    ("claude.completion", "messages.create"): "https://api.anthropic.example.com/v1/messages",
    ("anthropic.embed", "embeddings"):      "https://api.anthropic.example.com/v1/embeddings",

    # === v0.2 candidate — oracles ===
    ("switchboard.oracle", "price.get"):    "https://api.switchboard.example.com/v1/price.get",
    ("chainlink.oracle", "price.get"):      "https://api.chainlink.example.com/v1/price.get",

    # === v0.2 candidate — rpc ===
    ("triton.rpc", "getAccountInfo"):       "https://rpc.triton.example.com",
    ("triton.rpc", "sendTransaction"):      "https://rpc.triton.example.com",
    ("quicknode.rpc", "getAccountInfo"):    "https://rpc.quicknode.example.com",
    ("quicknode.rpc", "sendTransaction"):   "https://rpc.quicknode.example.com",
    ("syndica.rpc", "getAccountInfo"):      "https://rpc.syndica.example.com",
    ("syndica.rpc", "sendTransaction"):     "https://rpc.syndica.example.com",

    # === v0.2 candidate — data ===
    ("defillama.data", "protocol.tvl"):     "https://api.defillama.example.com/v1/protocol.tvl",
    ("defillama.data", "token.price"):      "https://api.defillama.example.com/v1/token.price",
    ("dune.data", "query.run"):             "https://api.dune.example.com/v1/query.run",
    ("thegraph.data", "subgraph.query"):    "https://api.thegraph.example.com/v1/subgraph.query",

    # === v0.2 candidate — search ===
    ("tavily.search", "search.web"):        "https://api.tavily.example.com/v1/search",
    ("exa.search", "search.web"):           "https://api.exa.example.com/v1/search",
    ("brave.search", "search.web"):         "https://api.brave.example.com/v1/search",

    # === v0.2 candidate — llm ===
    ("openai.completion", "chat.completions"):  "https://api.openai.example.com/v1/chat/completions",
    ("mistral.completion", "chat.completions"): "https://api.mistral.example.com/v1/chat/completions",
    ("groq.completion", "chat.completions"):    "https://api.groq.example.com/v1/chat/completions",
    ("gemini.completion", "generate.content"):  "https://api.gemini.example.com/v1/models:generateContent",
    ("xai.completion", "chat.completions"):     "https://api.xai.example.com/v1/chat/completions",

    # === v0.2 candidate — storage ===
    ("arweave.storage", "upload"):          "https://api.arweave.example.com/v1/upload",
    ("arweave.storage", "fetch"):           "https://api.arweave.example.com/v1/fetch",
    ("irys.storage", "upload"):             "https://api.irys.example.com/v1/upload",
    ("irys.storage", "fetch"):              "https://api.irys.example.com/v1/fetch",
    ("walrus.storage", "blob.put"):         "https://api.walrus.example.com/v1/blob.put",
    ("walrus.storage", "blob.get"):         "https://api.walrus.example.com/v1/blob.get",
}

# providers in v0.1 production status. all others are v0.2 candidates,
# wired in CATALOG above but not routed by default.
PRODUCTION_PROVIDERS: frozenset[str] = frozenset({
    "pyth.oracle",
    "jupiter.quote",
    "birdeye.token",
    "helius.rpc",
    "claude.completion",
    "anthropic.embed",
})


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
