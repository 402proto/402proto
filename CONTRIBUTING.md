# Contributing to 402proto

short version: prs welcome. read the spec first. discuss large changes in an issue before writing code.

## tl;dr

```bash
git clone https://github.com/402proto/402proto.git
cd 402proto

# python
cd sdk-py && pip install -e '.[dev]' && pytest

# typescript
cd sdk-ts && npm install && npm test

# rust
cd router-rs && cargo test
```

every package has its own README with package-specific instructions.

## what we want

- **new provider integrations.** add a provider to `sdk-py/src/proto402/providers/`, document it in `spec/providers.md`, ship an example in `examples/`.
- **example recipes.** end-to-end demos that pair 402proto with real agent frameworks (langchain, anthropic sdk, claude code, cursor, openai assistants).
- **router improvements.** retry policies, failover algorithms, provider scoring heuristics live in `router-rs/src/`.
- **spec clarifications.** if the envelope spec is ambiguous and you can show two implementations disagreeing, file an issue with both reproductions.

## what we do not want

- **token / financial speculation issues.** there is no token. price discussion belongs elsewhere.
- **"add my favorite chain" prs** without spec proposal first. l2 expansion is in v0.4. coordinate before implementing.
- **breaking spec changes** without a written rationale in `spec/changes/`. the envelope is meant to be stable.
- **agent wrappers** that hide the http 402 flow. clients must surface the quote before signing.

## process

1. **issue first.** for anything bigger than a typo, open an issue. tag it with the package (`sdk-py`, `router-rs`, `spec`, etc).
2. **branch from main.** name branches `feat/<short>`, `fix/<short>`, `spec/<short>`.
3. **conventional commits.** `feat(scope):`, `fix(scope):`, `refactor:`, `docs:`, `test:`, `chore:`, `ci:`. one logical change per commit.
4. **tests stay green.** every package has its own CI matrix. if you touch `sdk-py/`, run `pytest`. if you touch `router-rs/`, run `cargo test`. ci will yell at you on push if you skip.
5. **codeowner review.** the codeowner for the touched zone must approve. spec changes need two approvals.

## voice

402proto docs and commit messages follow the project voice. quick rules:

- lowercase prose, no emoji in code comments or commit messages
- first-person from the protocol pov in spec text ("the router signs", not "we sign")
- evidence over opinion. if you claim something is faster, paste a benchmark
- no ai-generated-and-not-edited prose. the spec is read by implementers, not by skimmers

## bug reports

use the `bug_report` issue template. include:

- which package (sdk-py / sdk-ts / router-rs / mcp-server / spec)
- version (output of `402proto --version` or the relevant package version)
- reproducer (smallest possible)
- expected vs actual

## security

**do not file public issues for security bugs.** see [SECURITY.md](SECURITY.md).

## license

by contributing, you agree your contributions are mit licensed.
