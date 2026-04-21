# 402proto improvement proposals (402PIP)

each 402PIP describes a proposed change to the 402proto spec. proposals start as draft, move through discussion, end up accepted (merged into the spec) or rejected.

## active

| id | title | status | sponsor |
|---|---|---|---|
| 402PIP-04 | provider self-registration | draft | mikrohash |
| 402PIP-05 | revocable quotes | draft | 0xnova |
| 402PIP-06 | eip-3009 settle on l2 | discussion | 402proto |

## accepted (in spec)

| id | title | version |
|---|---|---|
| 402PIP-01 | envelope shape | v0.1 |
| 402PIP-02 | ed25519 signing over canonical body | v0.1 |
| 402PIP-03 | usdc spl-transfer settlement on solana | v0.1 |

## process

1. **draft** — author writes `<id>.md` in this directory. file an issue with the `spec` label.
2. **discussion** — at least two maintainers comment. usually a week.
3. **accepted** — merged into the relevant `spec/*.md`. the proposal file stays here as historical record.
4. **rejected** — file kept with a `# REJECTED` header explaining why.

draft proposals carry no version commitment. accepted proposals are tied to a specific version in `versioning.md`.
