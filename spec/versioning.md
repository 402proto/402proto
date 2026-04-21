# Versioning

402proto follows semantic versioning at the wire-format level.

## current

**v0.1** — accepted 2026-05-12. all artifacts in this directory describe v0.1.

## scheme

`major.minor`

- **major** — bumped when a required header is renamed, removed, or its meaning changes. clients must adapt.
- **minor** — bumped when new optional headers are added, new error codes added, or new chains supported. clients on older minors still interoperate but miss new features.

patch versions exist for sdk releases, not for the spec.

## negotiation

every client request carries `x-402proto-version`. providers compare to their own supported range.

| client says | provider supports | result |
|---|---|---|
| `0.1` | `>= 0.1` | OK |
| `0.1` | only `0.2` | OK (providers MUST stay backwards-compat within major) |
| `0.2` | only `0.1` | provider returns `400 unsupported-version` |
| `1.0` | `>= 0.1` | provider returns `400 unsupported-version` (major bump) |

clients SHOULD send the lowest version they actually need.

## envelope-level compat

within a major version:

- a v0.1 client MUST be able to settle against a v0.2 provider.
- a v0.2 client MAY use v0.2-only headers when talking to a v0.2 provider, and MUST fall back to v0.1 semantics when talking to a v0.1 provider.

## deprecation

a deprecated header is announced one minor in advance. example timeline:

| version | event |
|---|---|
| v0.4 | introduces `x-402proto-batch-quote-id` |
| v0.5 | deprecates `x-402proto-quote-id` (still works, emits warning) |
| v1.0 | removes `x-402proto-quote-id` (major bump, breaking) |

## change proposals

spec changes go through 402PIPs (402proto improvement proposals). each PIP lives in [changes/](changes/) and contains:

- motivation
- proposed envelope changes
- migration path for existing clients
- rationale for any breaking change

draft → discussion → accepted → merged. only the `accepted` proposals translate into actual spec text.

see [changes/README.md](changes/README.md) for the current list.
