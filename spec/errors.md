# Errors

402proto uses standard http status codes plus an `x-402proto-error` header to communicate failure reasons. clients use the header to decide whether to retry, re-quote, or surface the error to the agent.

## error envelope

every error response carries:

```
HTTP/1.1 <status>
Content-Type: application/json
x-402proto-error: <error-code>

{ "error": "<error-code>", "message": "<human readable>", "details": { ... } }
```

## error codes

| code | http | retryable | meaning |
|---|---|---|---|
| `unsupported-version` | 400 | no | `x-402proto-version` not supported by provider. |
| `bad-envelope` | 400 | no | required header missing or malformed. |
| `quote-expired` | 410 | re-quote | `x-402proto-expires` is in the past. client must re-fetch a quote. |
| `quote-unknown` | 404 | re-quote | quote id not recognized. likely expired and evicted. |
| `signature-invalid` | 403 | no | ed25519 signature does not verify or wallet mismatch. |
| `proof-missing` | 402 | yes | no usdc transfer matching quote id found on chain. wait for confirmation and retry. |
| `proof-underpaid` | 402 | re-quote | usdc transfer amount less than `x-402proto-price`. |
| `proof-recipient-mismatch` | 402 | no | transfer sent to wrong recipient. funds unrecoverable from 402proto's side. |
| `chain-unsupported` | 400 | no | `x-402proto-chain` not supported. v0.1 supports solana-mainnet + solana-devnet only. |
| `cap-exceeded` | 402 | re-quote | quote price exceeds client's `x-402proto-max-price`. |
| `rate-limited` | 429 | with backoff | provider rate-limit. retry after delay from `Retry-After`. |
| `provider-error` | 5xx | yes | provider-side failure. retry against same provider or fail over to another. |
| `usdc-mint-wrong` | 402 | no | client used wrong usdc mint on settle. v0.1 only accepts the canonical mainnet/devnet mints. |

## recovery semantics

clients (especially routers) implement these recovery actions per error:

| action | when |
|---|---|
| **abort** | non-retryable codes; surface error to agent immediately |
| **retry same** | proof-missing (after delay), rate-limited (after Retry-After) |
| **re-quote same provider** | quote-expired, cap-exceeded (if cap raised), quote-unknown |
| **failover to another provider** | provider-error 5xx persistent, repeated proof-recipient-mismatch |

## router behavior

router-rs default policy:

- **proof-missing**: retry after 2s, then 4s, then 8s (cap 30s). max 3 retries.
- **rate-limited**: respect `Retry-After`. fail over after 2 attempts.
- **provider-error**: immediate failover. mark provider unhealthy for 60s if 3 failures in a row.
- **signature-invalid**: abort. log loud — this means client bug or attack.

## error code stability

error codes are part of the public surface. renames bump the spec minor version. new codes are additive (clients must handle unknown codes gracefully, default to "abort").
