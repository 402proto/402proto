# @402proto/sdk — typescript client

```bash
npm i @402proto/sdk
```

## quickstart

```ts
import { Client } from "@402proto/sdk";

const client = new Client({
  wallet: process.env.PROTO402_WALLET!,   // base58 solana secret key
  cap: "10 USDC/day",
});

const quote = await client.call({
  provider: "pyth.oracle",
  method: "price.get",
  params: { symbol: "SOL/USD" },
  maxPrice: 0.005,
});

console.log(quote.payload);
console.log(quote.txSignature);
```

## what it does

- builds 402proto canonical body
- signs with ed25519 (`@noble/curves`)
- submits the usdc transfer on solana
- retries with proof headers
- returns the typed `Quote` response

zero hidden state. you bring the wallet, we bring the wire format.

## see also

- [@402proto/mcp](../mcp-server) — drop-in mcp server for claude code / cursor
- [proto402](../sdk-py) — python sdk
- [protocol spec](../spec)
