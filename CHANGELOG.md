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

## [unreleased]

planning v0.2. see [ROADMAP.md](ROADMAP.md).
