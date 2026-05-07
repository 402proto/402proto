# Envelope

the 402proto envelope is a small set of http headers and a typed body, exchanged between a client and a provider, with an optional router in the middle.

## request

a client sends a regular http request to a provider endpoint, plus a small set of `x-402proto-*` headers:

```
POST /v1/oracle/price.get HTTP/1.1
Host: pyth.example.com
Content-Type: application/json
x-402proto-version: 0.1
x-402proto-client: proto402-py/0.1.0
x-402proto-wallet: 7xKp...9mT4
x-402proto-max-price: 0.005

{ "symbol": "SOL/USD" }
```

### required headers

| header | description |
|---|---|
| `x-402proto-version` | spec version. clients MUST send the string `0.1` for v0.1. |
| `x-402proto-client` | client agent string. mirrors http `User-Agent` for protocol clients. |
| `x-402proto-wallet` | base58 solana pubkey of the wallet that will sign settlement. |

### optional headers

| header | description |
|---|---|
| `x-402proto-max-price` | client's price cap for this call (USDC). provider MUST reject with `402` if the quote exceeds. |
| `x-402proto-idempotency-key` | client-chosen UUIDv4 that lets the provider deduplicate retries during a quote ttl window. |

## response: 402 quote

if the endpoint is paid, the provider MUST respond with http `402 Payment Required` and the following headers:

```
HTTP/1.1 402 Payment Required
Content-Type: application/json
x-402proto-version: 0.1
x-402proto-provider: pyth.oracle
x-402proto-method: price.get
x-402proto-price: 0.001
x-402proto-currency: USDC
x-402proto-recipient: 7xKp...prov
x-402proto-ttl: 12
x-402proto-chain: solana-mainnet
x-402proto-quote-id: q_AB42xZ
x-402proto-nonce: 2c4e8a7f...
```

### required response headers

| header | description |
|---|---|
| `x-402proto-version` | echoes the request version. provider MUST reject mismatched versions with `400`. |
| `x-402proto-provider` | canonical provider id (e.g. `pyth.oracle`). |
| `x-402proto-method` | method on the provider being priced. |
| `x-402proto-price` | numeric price in `x-402proto-currency`. decimal string. |
| `x-402proto-currency` | currency symbol. v0.1 only supports `USDC`. |
| `x-402proto-recipient` | base58 solana pubkey to send usdc to. |
| `x-402proto-ttl` | quote validity in seconds. clients MUST settle within ttl. |
| `x-402proto-chain` | settlement chain. v0.1 supports `solana-mainnet` and `solana-devnet`. |
| `x-402proto-quote-id` | unique quote id. clients echo this in the settle request. |
| `x-402proto-nonce` | random 32-byte hex. prevents replay; included in canonical signing body. |

## response: 200 payload

after the client settles (see [settle.md](settle.md)), the provider returns the payload with one extra header:

```
HTTP/1.1 200 OK
Content-Type: application/json
x-402proto-receipt: 5j7B...kQz4

{ "symbol": "SOL/USD", "price": 142.387, "confidence": 0.04, "slot": 312455218 }
```

| header | description |
|---|---|
| `x-402proto-receipt` | solana transaction signature for the usdc transfer. clients store this. |

## canonical body for signing

the client signs a canonical body derived from the quote (not the http response). see [signing.md](signing.md).

## errors

if the provider rejects the request (e.g. quote expired, signature invalid, max-price too low), it responds with a 4xx status and an `x-402proto-error` header. see [errors.md](errors.md).

## backwards-compatible rules

- adding a new optional header does not bump the spec version.
- changing the meaning of an existing header bumps the spec version.
- removing a required header bumps the major version.

v0.1 → v0.2 is expected to add `x-402proto-batch-id` (for batched calls) and `x-402proto-revoke` (for revocable quotes). no breaking changes planned.
