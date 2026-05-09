# Maintainers

402proto is maintained by a small team. each maintainer owns a zone of the codebase. review responsibilities follow the [CODEOWNERS](.github/CODEOWNERS) file.

## Active maintainers

| handle | zones | github |
|---|---|---|
| **402proto** | spec, site, releases, security disclosures | [@402proto](https://github.com/402proto) |
| **0xnova** | router-rs (rust), retry + failover engine, low-level wire | rust ingest history |
| **mikrohash** | sdk-py, spec drafting, provider scoring | spec + py history |
| **luka** | sdk-ts, mcp-server, examples, demo cli | ts + node history |

## Review policy

- **two approvals** required for changes to `spec/` (envelope format) or `router-rs/` (settle path).
- **one approval** for `sdk-py/`, `sdk-ts/`, `mcp-server/`, `examples/`, `site/`.
- **codeowner approval** required for any path touching their zone.

prs that touch the envelope or settle path block release until the spec change is documented in `CHANGELOG.md`.

## Security

see [SECURITY.md](SECURITY.md) for disclosure email and scope.

## Onboarding new maintainers

new maintainers come from sustained contribution. typical path:

1. ship 3+ meaningful prs across a zone.
2. get nominated by an existing maintainer.
3. zone is added to CODEOWNERS.

we do not solicit maintainers.
