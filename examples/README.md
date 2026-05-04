# 402proto examples

end-to-end recipes that pair 402proto with real-world agent setups.

## list

- [pyth-price-feed.py](pyth-price-feed.py) — fetch SOL/USD from pyth, settle one usdc transfer.
- [jupiter-quote.py](jupiter-quote.py) — request a jupiter swap quote.
- [claude-with-pay.ts](claude-with-pay.ts) — wire claude completion through 402proto so every llm call settles per-tokens-out.
- [agent-loop.py](agent-loop.py) — minimal agent that reads a feed, asks claude to summarize, settles both calls.
- [mcp-with-cursor.md](mcp-with-cursor.md) — set up `@402proto/mcp` in cursor.
- [mcp-with-claude-code.md](mcp-with-claude-code.md) — set up `@402proto/mcp` in claude code.

## running

set `PROTO402_NETWORK=devnet` to test against devnet.

each python example expects:

```bash
export PROTO402_WALLET=<base58 solana secret key>
```

each ts example expects the same env var + a node 18+ runtime.

## fake data note

v0.1 providers in `spec/providers.md` use placeholder hosts (api.pyth.example.com etc) until production routing is wired in v0.1.1. examples log the envelope flow without making real network calls.
