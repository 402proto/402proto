# Security Policy

## Scope

402proto is a payment protocol. funds move on-chain. security matters.

### in scope

- envelope format bugs that let an attacker spoof a quote
- signing rule bugs that accept malformed signatures
- router bugs that pay before receiving proof of response, or vice versa
- sdk bugs that leak the wallet private key or send transactions without user signing
- settlement contract bugs (when deployed on mainnet, v0.2+)

### not in scope

- denial of service against a specific provider
- typos in spec markdown
- ui bugs in the site/console that do not affect settle path
- dependency vulnerabilities that are not exploitable in our usage

## Disclosure

email **security@402proto.xyz** with:

- a clear description of the bug
- steps to reproduce
- impact assessment (what can an attacker do)
- your handle for credit (or anonymous)

we will respond within 72 hours with an acknowledgement and a coordinated disclosure timeline.

**do not file a public issue for security bugs.** they get the same triage queue as feature requests, which is not what you want.

## Pgp

pgp key for sensitive disclosures: pending mainnet launch.

## Bounty

no formal bounty program in v0.1. we will credit your handle in the security section of the release that fixes the issue, and provide acknowledgement once mainnet settlement is live.
