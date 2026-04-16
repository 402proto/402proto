# Settle

after receiving a `402` quote, the client settles by sending a usdc transfer on solana to the provider's `x-402proto-recipient`, then sending a follow-up http request that proves the transfer.

## v0.1: direct usdc transfer

v0.1 uses a plain spl-token transfer of the `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` mainnet USDC mint (or its devnet equivalent).

### transfer requirements

| field | value |
|---|---|
| token mint | mainnet: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| token mint (devnet) | `Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr` |
| from | `x-402proto-wallet` (ata derived) |
| to | `x-402proto-recipient` (ata derived) |
| amount | `x-402proto-price` × 10^6 (usdc has 6 decimals) |
| memo | quote id, embedded via memo program: `402proto/0.1 q=<quote-id>` |

### memo format

the memo program (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`) instruction carries a small string that lets the provider locate the transfer by quote id.

```
402proto/0.1 q=<quote-id>
```

clients MUST include this memo in the same transaction as the spl-token transfer. providers reject transfers without a matching memo.

## settle request

after the transaction lands on chain, the client retries the original http request, with additional headers:

```
POST /v1/oracle/price.get HTTP/1.1
Host: pyth.example.com
Content-Type: application/json
x-402proto-version: 0.1
x-402proto-wallet: 7xKp...9mT4
x-402proto-quote-id: q_AB42xZ
x-402proto-expires: 1747066412
x-402proto-receipt: 5j7B...kQz4
x-402proto-signature: <base58-ed25519 over canonical body>

{ "symbol": "SOL/USD" }
```

| header | description |
|---|---|
| `x-402proto-receipt` | solana transaction signature (base58) for the usdc transfer. |
| `x-402proto-signature` | ed25519 signature over the canonical body (see [signing.md](signing.md)). |
| `x-402proto-expires` | unix-seconds expiry computed by client. provider verifies against current time. |

## provider checks

before returning the response payload, the provider:

1. **canonical body**: rebuilds the canonical body and compares byte-for-byte.
2. **signature**: verifies ed25519 against `x-402proto-wallet`.
3. **on-chain proof**: queries solana rpc for `x-402proto-receipt`. confirms:
   - signed by `x-402proto-wallet`
   - spl-token transfer present
   - to ata = derived from `x-402proto-recipient`
   - amount ≥ `x-402proto-price` × 10^6 (rounded)
   - memo present and matches quote id
   - status: `Confirmed` or `Finalized`
4. **ttl**: confirms `x-402proto-expires > now()`.
5. **idempotency**: confirms this quote-id has not already been served. if yes, returns the cached response (within ttl window).

if all checks pass, the provider returns 200 + payload + `x-402proto-receipt` header echoed.

## v0.2 (planned): allowance settle

v0.2 introduces an optional allowance contract: clients pre-fund a small pool, providers debit it directly. removes the two-roundtrip overhead. see [changes/402PIP-04.md](changes/402PIP-04.md) (draft).

## v0.4 (planned): l2 settle via eip-3009

base, arbitrum, op support via `transferWithAuthorization` (eip-3009). see [changes/402PIP-06.md](changes/402PIP-06.md) (discussion).

## why not eip-712 / eip-3009 on solana

solana has its own signature model (ed25519 over transaction bytes). retrofitting eip-712 makes verification harder for native solana tooling. v0.1 sticks to native solana primitives.
