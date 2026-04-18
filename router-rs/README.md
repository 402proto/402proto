# proto402-router

quote router for 402proto. forwards client requests to providers, handles 402 quotes, retries, fails over.

## what it does

- accepts http requests with `x-402proto-*` headers
- forwards to the right provider (or many in parallel for quote shopping)
- enforces client `max_price` cap
- retries on `proof-missing`, `rate-limited`, `provider-error`
- fails over to alternate providers when one is unhealthy
- emits prometheus metrics + structured tracing

## what it does NOT do

- does NOT sign anything. signing is the client's job.
- does NOT hold funds. settlement goes wallet-to-provider directly.
- does NOT cache provider responses. every paid call results in a new on-chain transfer.

## why rust

the router is on the hot path. quote latency budget is < 100ms. rust gives us predictable tail latency and easy concurrency.

## build

```bash
cargo build --release
```

binary lands at `target/release/proto402-router`.

## run

```bash
proto402-router --listen 0.0.0.0:7402 --catalog ./catalog.json
```

## crate structure

```
src/
├── lib.rs               public api: Router::new, Router::serve
├── envelope.rs          parse / build x-402proto-* headers
├── signing.rs           ed25519 verify (canonical body)
├── retry.rs             retry policy
├── failover.rs          provider scoring + selection
├── catalog.rs           provider catalog
├── error.rs             RouterError + From impls
├── metrics.rs           prometheus counters / histograms
└── bin/router.rs        cli entry
```

see crate docs (`cargo doc --open`) for full api.

## bench

`cargo bench` runs quote-path microbenchmarks. p99 routing overhead on a release build is < 4ms on a typical x86_64 server.
