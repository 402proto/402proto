# proto402 — python sdk

python client + cli for 402proto.

```bash
pip install proto402
```

## quickstart

```python
import os
from proto402 import Client

client = Client(
    wallet=os.environ["PROTO402_WALLET"],   # solana keypair, base58 secret key
    cap="10 USDC/day",                       # hard daily cap
)

quote = client.call(
    provider="pyth.oracle",
    method="price.get",
    params={"symbol": "SOL/USD"},
    max_price=0.005,                         # USDC
)

print(quote.payload)        # provider response
print(quote.tx_signature)   # solana tx that settled this call
```

## cli

```bash
402proto call pyth.oracle price.get --params '{"symbol":"SOL/USD"}' --max 0.005
402proto providers list
402proto balance
402proto history --since 1d --csv
```

## what it does

- builds the 402proto canonical body
- signs with your wallet (ed25519 over the canonical body)
- submits the usdc spl-token transfer on solana
- retries the http request with proof headers
- returns the typed `Quote` response

## what it does NOT do

- does not hold funds (your wallet signs every transfer)
- does not auto-approve calls (you set `cap`, `max_price` per call)
- does not skip on-chain verification (every settle waits for confirmation)

## structure

```
src/proto402/
├── __init__.py        public api (Client, Quote, Error)
├── client.py          client + call() entry point
├── envelope.py        canonical body builder, header parser
├── signing.py         ed25519 signing helpers
├── settle.py          solana spl-transfer + memo builder
├── retry.py           retry policy
├── providers/         provider-specific adapters
│   ├── pyth.py
│   ├── jupiter.py
│   ├── birdeye.py
│   ├── helius.py
│   ├── claude.py
│   └── anthropic_embed.py
├── cli.py             typer cli (entry point: 402proto)
└── config.py          pydantic-settings config
```

## config

via env or `.env`:

| env | description |
|---|---|
| `PROTO402_WALLET` | base58 solana secret key (or path to keypair json) |
| `PROTO402_CAP_DAILY` | daily usdc cap, e.g. `10` |
| `PROTO402_RPC_URL` | solana rpc endpoint. defaults to mainnet beta. |
| `PROTO402_NETWORK` | `mainnet` or `devnet`. defaults to `mainnet`. |

## development

```bash
pip install -e '.[dev]'
ruff check src tests
pytest -q
```

see [CONTRIBUTING.md](../CONTRIBUTING.md) at repo root.
