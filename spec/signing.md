# Signing

every settled call carries a wallet signature over a canonical body. the signature proves the wallet owner authorized this exact quote on this exact chain.

## algorithm

- **scheme**: ed25519
- **key**: the solana wallet keypair already used for transactions
- **message**: the canonical body (defined below)
- **encoding**: signature is base58-encoded for transport, raw 64 bytes for storage

## canonical body

the body that gets signed is built from the quote response, NOT the http response body or any client-side payload. this prevents tampering with the http transport layer.

```
402proto/0.1
provider=<x-402proto-provider>
method=<x-402proto-method>
price=<x-402proto-price>
currency=<x-402proto-currency>
recipient=<x-402proto-recipient>
chain=<x-402proto-chain>
quote_id=<x-402proto-quote-id>
nonce=<x-402proto-nonce>
wallet=<x-402proto-wallet>
ttl_expires_at=<unix_seconds>
```

### rules

- exactly one field per line, in this exact order.
- key and value separated by `=` (no spaces).
- newline between lines is `\n` (single byte, no CRLF).
- no trailing newline at end of body.
- all values are utf-8 encoded.

`ttl_expires_at` is computed by the client as `quote_received_at + x-402proto-ttl`. it MUST be sent back to the provider in the settle request (as `x-402proto-expires`).

## verification

a provider verifies:

1. parse the canonical body from the settle request's headers.
2. recompute the expected canonical body locally from the quote it issued.
3. compare byte-for-byte.
4. verify ed25519 signature against `x-402proto-wallet`.
5. confirm `ttl_expires_at` has not passed.
6. confirm the on-chain usdc transfer (see [settle.md](settle.md)) is signed by the same wallet, paid to `x-402proto-recipient`, in the amount of `x-402proto-price`.

if any step fails, the provider rejects with `402` (re-quote) or `403` (signature invalid) or `410` (quote expired).

## why not jose / jwt

jose is heavy for this use case. clients are agents and cli tools, often running embedded in larger systems. a plain canonical-body signature keeps the proof minimal and the verification logic boring.

## test vectors

reference test vectors live in [test-vectors/signing.json](test-vectors/signing.json) (added in v0.1.1 once router-rs and sdk-py cross-verify cleanly).
