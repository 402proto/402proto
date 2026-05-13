# Provider catalog

a provider is anything that speaks the 402proto envelope. v0.1 ships a curated list. v0.2 introduces self-registration.

## v0.1 catalog

| id | category | base url | methods | est. price (USDC) |
|---|---|---|---|---|
| `pyth.oracle` | oracle | https://api.pyth.example.com | `price.get` | 0.001 |
| `jupiter.quote` | dex aggregator | https://api.jupiter.example.com | `quote`, `swap.build` | 0.005 |
| `birdeye.token` | data | https://api.birdeye.example.com | `token.meta`, `token.holders` | 0.002 |
| `helius.rpc` | rpc | https://rpc.helius.example.com | full json-rpc surface | 0.0008 |
| `claude.completion` | llm | https://api.anthropic.example.com | `messages.create` | by tokens |
| `anthropic.embed` | llm | https://api.anthropic.example.com | `embeddings` | 0.0004 |

URLs above are placeholders. the actual production routing is done via the router, which abstracts the underlying endpoint.

## v0.2 candidate catalog

these 19 providers are wired into `sdk-py/src/proto402/providers/__init__.py` and `sdk-ts/src/catalog.ts` but disabled in the router until their upstream implements the 402proto envelope. status: 🟡 candidate.

| id | category | base url | methods | est. price (USDC) |
|---|---|---|---|---|
| `switchboard.oracle` | oracle | https://api.switchboard.example.com | `price.get` | 0.001 |
| `chainlink.oracle` | oracle | https://api.chainlink.example.com | `price.get` | 0.001 |
| `triton.rpc` | rpc | https://rpc.triton.example.com | `getAccountInfo`, `sendTransaction` | 0.0008 |
| `quicknode.rpc` | rpc | https://rpc.quicknode.example.com | `getAccountInfo`, `sendTransaction` | 0.0008 |
| `syndica.rpc` | rpc | https://rpc.syndica.example.com | `getAccountInfo`, `sendTransaction` | 0.0008 |
| `defillama.data` | data | https://api.defillama.example.com | `protocol.tvl`, `token.price` | 0.001 |
| `dune.data` | data | https://api.dune.example.com | `query.run` | 0.01 |
| `thegraph.data` | data | https://api.thegraph.example.com | `subgraph.query` | 0.002 |
| `tavily.search` | search | https://api.tavily.example.com | `search.web` | 0.005 |
| `exa.search` | search | https://api.exa.example.com | `search.web` | 0.005 |
| `brave.search` | search | https://api.brave.example.com | `search.web` | 0.003 |
| `openai.completion` | llm | https://api.openai.example.com | `chat.completions` | 0.02 |
| `mistral.completion` | llm | https://api.mistral.example.com | `chat.completions` | 0.008 |
| `groq.completion` | llm | https://api.groq.example.com | `chat.completions` | 0.002 |
| `gemini.completion` | llm | https://api.gemini.example.com | `generate.content` | 0.01 |
| `xai.completion` | llm | https://api.xai.example.com | `chat.completions` | 0.015 |
| `arweave.storage` | storage | https://api.arweave.example.com | `upload`, `fetch` | 0.05 / 0.001 |
| `irys.storage` | storage | https://api.irys.example.com | `upload`, `fetch` | 0.03 / 0.001 |
| `walrus.storage` | storage | https://api.walrus.example.com | `blob.put`, `blob.get` | 0.02 / 0.001 |

once an upstream provider implements 402, their entry promotes from 🟡 → 🟢 in the next release. routers refuse to settle against 🟡 candidates by default — clients must explicitly opt-in per provider.

## provider id format

```
<vendor>.<surface>
```

- `vendor` — lowercase ascii, no spaces. corresponds to the api owner (pyth, jupiter, anthropic, etc).
- `surface` — area of functionality (oracle, rpc, completion, embed, token, ...).

a single vendor may have multiple surfaces (e.g. `anthropic.completion` + `anthropic.embed`).

## category taxonomy

| category | description |
|---|---|
| `rpc` | chain rpc surfaces (read + write) |
| `oracle` | price feeds, confidence intervals |
| `dex` | swap quoting, route building, aggregation |
| `data` | indexed token / wallet / protocol data |
| `search` | web search, scraping, document retrieval |
| `llm` | language model completion + embeddings |
| `storage` | content-addressed storage (arweave, irys, walrus) |
| `oracle.custom` | bespoke oracles (e.g. private feeds) |
| `other` | anything that does not fit |

new categories require a 402PIP.

## v0.2: provider self-registration

draft proposal [402PIP-04](changes/402PIP-04.md) (target v0.2):

```bash
402proto register \
  --id mycorp.search \
  --category search \
  --base-url https://api.mycorp.com \
  --methods "search.text,search.images" \
  --signer <ed25519-pubkey> \
  --treasury <solana-pubkey>
```

writes a record to an on-chain registry program. routers index the registry and surface new providers automatically. requires a small one-time SOL deposit (anti-spam) which is refunded if the provider passes quality bar (50+ successful settles in 30 days).

## quality bar

providers in the curated v0.1 list must:

- ✅ respond with valid `402` envelope on paid endpoints
- ✅ verify on-chain proof before serving payload
- ✅ accept settle requests within 12-second ttl
- ✅ idempotent within ttl window (re-serve cached response for same quote id)
- ✅ publish public docs with envelope examples

failing providers get downgraded in router scoring. persistent failure removes them from the catalog.

## status legend

- 🟢 production — routed by default
- 🟡 candidate — wired but disabled until quality bar met
- 🔴 deprecated — kept for compat, will be removed in next minor

current status of all v0.1 providers: 🟢.
