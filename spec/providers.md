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
