# 402proto + cursor

set up `@402proto/mcp` in cursor.

## install

```bash
npm i -g @402proto/mcp
```

## configure

cursor → settings → mcp servers → add new:

| field | value |
|---|---|
| name | `402proto` |
| command | `402proto-mcp` |
| args | `--wallet`  `${env:PROTO402_WALLET}`  `--cap`  `5 USDC/day` |

set `PROTO402_WALLET` in your shell profile so cursor inherits it.

## verify

new chat → `@402proto pyth_oracle_price_get { "symbol": "SOL/USD" }`

cursor surfaces the 402 quote, settles on confirm, returns the payload.

## notes

- stdio transport only in v0.1. http transport in v0.2 lets you run the mcp server on a separate host.
- every settle is on-chain. you can audit your daily spend via solana explorer using the wallet address.
- there is no rate limit imposed by 402proto. provider-side rate limits return `429` / `rate-limited` and the router retries with backoff.
