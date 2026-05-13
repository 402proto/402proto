# Changelog

all notable changes to 402proto.

format follows [keep a changelog](https://keepachangelog.com/en/1.1.0/).

## [v0.1.0] — 2026-05-12

first public release. the envelope is stable, the sdk shells are usable, the router round-trips on devnet.

### added
- **spec/** — http 402 envelope spec v0.1 (request, response, headers, signing rules)
- **sdk-py/** — python client (`proto402`) + cli (`402proto`)
- **sdk-ts/** — typescript client (`@402proto/sdk`)
- **router-rs/** — rust quote router with retry + failover
- **mcp-server/** — node mcp server (`@402proto/mcp`) for claude code / cursor
- **site/** — landing + dashboard console (mock state, real wallet ui pending)
- six provider integrations: pyth.oracle, jupiter.quote, birdeye.token, helius.rpc, claude.completion, anthropic.embed
- examples: pyth price feed, jupiter quote, claude completion, end-to-end agent loop

### what is NOT in v0.1
- no mainnet settlement contract (devnet only). agents quote and settle against a test usdc mint.
- no provider self-registration. catalog is hard-coded in `spec/providers.md`.
- no l2 settlement. solana mainnet + devnet only.
- no fleet/team wallet abstraction. one wallet per client instance.
- mcp server is stdio-only. http transport in v0.2.

### honest status
this is an early protocol. the envelope shape is unlikely to change in v0.2, but provider details, error codes, and the router api are still moving. pin versions. expect breakage.

### contributors this release
- 402proto (spec, site, integration, release)
- 0xnova (router-rs, retry, failover)
- mikrohash (sdk-py, spec drafting, scoring rules)
- luka (sdk-ts, mcp-server, examples, demo cli)

---

## [unreleased] — v0.2 in progress

### added
- **sdk-py**: real on-chain settle path. `settle.submit_transfer` now builds, signs, and submits an spl-token usdc transfer with the quote-id memo, via `solders` + `solana-py`. enable with `pip install 'proto402[chain]'`.
- **sdk-py**: `dry_run` flag on `submit_transfer` — build and sign without RPC submission, for offline tests and CI.
- **sdk-py**: `tests/test_settle.py` covering mint mapping, micro-unit conversion, and the chain-deps-missing branch.

### changed
- **sdk-py**: bump to `0.2.0.dev0`.
- **sdk-py**: chain dependencies (`solders`, `solana`) moved to optional `[chain]` extra so the base install stays light.

### fixed
- **sdk-py**: settlement no longer returns a fabricated base58 signature when chain extras are absent — it raises `settle.ChainDependencyMissing` instead. previous behavior silently faked a receipt that providers would reject on-chain.
- **ROADMAP**: corrected the v0.2 "mainnet settlement contract (audited, anza)" line — that contract was not in fact shipped. the real status is "sdk-py settle path now hits the live spl-token program; mainnet rollout depends on provider migration to v0.2".

### planned next in v0.2
- real on-chain settle in sdk-ts (still stubbed)
- provider self-registration via `proto402 register`
- http transport for `mcp-server` (currently stdio-only)
- router-rs prometheus metrics endpoint
- envelope v0.2: revocable quotes, batched calls
- catalog expansion (see ROADMAP.md)


## release sign-off

- spec frozen as of 2026-05-09
- v0.1.0 tag follows
