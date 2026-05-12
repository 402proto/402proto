# test vectors

cross-implementation test vectors for 402proto. every sdk and router MUST pass these to claim conformance.

## files

- [signing.json](signing.json) — canonical-body strings + expected ed25519 signatures
- [envelope.json](envelope.json) — request/response header shapes
- [settle.json](settle.json) — example settle payloads (planned)

## conventions

- all keys are base58 (solana convention)
- all signatures are base58
- all canonical bodies are byte-for-byte representations (look for `\n` separators)
- json fields named `_expected_*` are the verification targets
