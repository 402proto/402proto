# Roadmap

402proto is shipped in versioned increments. no dates. follow the commits.

## v0.1 — shipped 2026-05-12

- envelope spec v0.1 (request, response, headers)
- signing rules (ed25519 over canonical body)
- python sdk + cli
- typescript sdk
- rust router + retry + failover
- node mcp server
- six provider integrations
- devnet end-to-end demo

## v0.2 — in progress

target: expand catalog to 72+ providers, settle on mainnet.

- [x] real on-chain settle in sdk-py — `settle.submit_transfer` builds and submits the actual spl-token transfer + memo via solders + solana-py. install `proto402[chain]` to enable.
- [ ] real on-chain settle in sdk-ts (still stubbed)
- [ ] provider self-registration via `proto402 register`
- [ ] http transport for mcp-server (not just stdio)
- [ ] router metrics exposed via prometheus
- [ ] envelope v0.2: revocable quotes, batched calls
- [ ] catalog expansion targets:
  - oracles: switchboard, chainlink
  - rpc: triton, quicknode, syndica
  - data: defillama, dune, the graph
  - search: tavily, exa, brave
  - llm: openai, mistral, groq, gemini, xai
  - storage: arweave, irys, walrus

## v0.3 — planned

target: enterprise fleet support, volume pricing.

- [ ] reserved pools with on-chain allowance
- [ ] team wallets with role-based signers
- [ ] volume tier pricing (markup decreases with monthly volume)
- [ ] per-agent caps enforced by a guard contract
- [ ] csv ledger export from solana rpc, no off-chain log

## v0.4 — planned

target: l2 expansion.

- [ ] eip-3009 settlement on base
- [ ] eip-3009 settlement on arbitrum + op
- [ ] cross-chain wallet abstraction
- [ ] bridge-aware routing (settle on the cheapest chain for the caller)

## not in scope

- holding user funds
- running provider infrastructure ourselves
- subsidizing call costs through a token
- on-chain governance of the catalog

402proto stays a wire format plus a router plus settlement. that is the boundary.
