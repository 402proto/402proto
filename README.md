<div align="center">

```
            ██╗  ██╗ ██████╗ ██████╗ ██████╗ ██████╗  ██████╗ ████████╗ ██████╗
            ██║  ██║██╔═████╗╚════██╗██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔═══██╗
            ███████║██║██╔██║ █████╔╝██████╔╝██████╔╝██║   ██║   ██║   ██║   ██║
            ╚════██║████╔╝██║██╔═══╝ ██╔═══╝ ██╔══██╗██║   ██║   ██║   ██║   ██║
                 ██║╚██████╔╝███████╗██║     ██║  ██║╚██████╔╝   ██║   ╚██████╔╝
                 ╚═╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝
```

### open payment protocol for paid apis
no signup. no api keys. agents quote, sign, settle in usdc on ethereum.

[![License: MIT](https://img.shields.io/badge/license-MIT-white.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-beta-yellow.svg)]()
[![CI](https://img.shields.io/badge/ci-passing-brightgreen.svg)]()
[![Spec](https://img.shields.io/badge/spec-v0.1-blue.svg)](spec/)

[![Ethereum](https://img.shields.io/badge/ethereum-mainnet-627EEA.svg)]()
[![USDC](https://img.shields.io/badge/settle-USDC-2775CA.svg)]()
[![Python](https://img.shields.io/badge/python-3.9+-3776AB.svg)]()
[![Rust](https://img.shields.io/badge/rust-stable-orange.svg)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6.svg)]()

---

[**what it is**](#what-it-is) ·
[**how a call works**](#how-a-call-works) ·
[**quickstart**](#quickstart) ·
[**spec**](spec/README.md) ·
[**roadmap**](ROADMAP.md)

</div>

---

## what it is

402proto is an open payment protocol that lets ai agents and cli tools call paid apis without signup, without api keys, without monthly billing. every call is a tiny usdc transfer on ethereum, signed by the agent wallet, settled in under two seconds.

three properties define it:

- **non-custodial.** the agent wallet pays. nothing escrows funds. no third party holds your usdc.
- **open spec.** the http 402 envelope is mit-licensed. anyone can implement a provider or a client.
- **on-chain ledger.** every paid call is a signed ethereum transaction. queryable, exportable, audit-grade.

402proto is **not a payment processor.** it is a wire format plus a router plus a settlement contract. providers and clients run their own infrastructure.

## how a call works

```
  agent                router               provider              ethereum
    |                    |                     |                    |
    |-- request -------->|                     |                    |
    |                    |-- forward --------->|                    |
    |                    |<-- 402 + quote -----|                    |
    |<-- quote ----------|                     |                    |
    |-- sign + settle -->|                     |                    |
    |                    |-- usdc transfer ----+------------------->|
    |                    |                     |<-- confirmation ---|
    |                    |-- retry w/ proof -->|                    |
    |                    |<-- response --------|                    |
    |<-- payload --------|                     |                    |
```

one round trip. no escrow. failed transfer means no payload. failed payload means no transfer.

## quickstart

three drop-in surfaces. pick whichever fits your agent.

### cli

```bash
npm i -g 402proto
402proto call chainlink.feed price.get --params '{"symbol":"ETH/USD"}' --max 0.005
```

### python sdk

```bash
pip install proto402
```

```python
from proto402 import Client

client = Client(wallet=os.environ["PROTO402_WALLET"], cap="10 USDC/day")
quote = client.call(
    provider="chainlink.feed",
    method="price.get",
    params={"symbol": "ETH/USD"},
    max_price=0.005,
)
print(quote.payload, quote.tx_signature)
```

### typescript / mcp

```bash
npm i @402proto/sdk
```

```ts
import { Client } from "@402proto/sdk";

const client = new Client({ wallet: process.env.PROTO402_WALLET, cap: "10 USDC/day" });
const quote = await client.call({
  provider: "chainlink.feed",
  method: "price.get",
  params: { symbol: "ETH/USD" },
  maxPrice: 0.005,
});
console.log(quote.payload, quote.txSignature);
```

mcp server:

```bash
npm i -g @402proto/mcp
402proto-mcp --wallet $PROTO402_WALLET
```

then point claude code / cursor at it. agents call providers as native tools, 402proto settles in the background.

## architecture

```
402proto/
├── site/         next-static landing + console (dashboard.html)
├── spec/         http 402 envelope spec (markdown)
├── sdk-py/       python client + cli (proto402)
├── sdk-ts/       typescript client (@402proto/sdk)
├── router-rs/    rust quote router + retry / failover engine
├── mcp-server/   node mcp server (@402proto/mcp)
└── examples/     end-to-end usage demos
```

| zone | owner | language |
|---|---|---|
| site/ | luka | html + js |
| spec/ | mikrohash | markdown |
| sdk-py/ | mikrohash | python |
| sdk-ts/ | luka | typescript |
| router-rs/ | 0xnova | rust |
| mcp-server/ | luka | typescript |

see [MAINTAINERS.md](MAINTAINERS.md) and [.github/CODEOWNERS](.github/CODEOWNERS).

## supported providers

shipped in v0.1 — 6 providers, expanding to 72+ in v0.2.

| provider | method | est. price | status |
|---|---|---|---|
| chainlink.feed | `price.get` | $0.001 | 🟢 |
| uniswap.quote | `quote` | $0.005 | 🟢 |
| dexscreener.token | `token.meta` | $0.002 | 🟢 |
| alchemy.rpc | `getAccountInfo` | $0.0008 | 🟢 |
| claude.completion | `messages.create` | varies | 🟡 ready |
| anthropic.embed | `embeddings` | $0.0004 | 🟡 ready |

## roadmap

| version | feature | status |
|---|---|---|
| **v0.1** | envelope spec, py + ts sdk, rust router, mcp, 6 providers | 🟢 shipped |
| **v0.2** | full catalog (72+ providers), provider self-registration | 🛠 in progress |
| **v0.3** | reserved pools, volume tier pricing, fleet wallets | ⏳ planned |
| **v0.4** | l2 expansion (base, arbitrum), eip-3009 settlement | ⏳ planned |

## contributing

we're early. quick wins for new contributors:

- add a provider integration in `sdk-py/src/proto402/providers/` (mark them in `spec/providers.md`)
- write a recipe in `examples/` (e.g. "claude code + 402proto + uniswap")
- improve the router retry policy in `router-rs/src/retry.rs`
- file an issue with an api you wish 402proto supported

read [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## license

MIT, see [LICENSE](LICENSE). spec also under MIT in [spec/LICENSE](spec/LICENSE).
