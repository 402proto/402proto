import { test } from "node:test";
import assert from "node:assert/strict";

import { CATALOG, listProviders, resolve } from "./catalog.js";

test("v0.1 catalog includes the six providers", () => {
  const providers = listProviders();
  for (const id of [
    "pyth.oracle",
    "jupiter.quote",
    "birdeye.token",
    "helius.rpc",
    "claude.completion",
    "anthropic.embed",
  ]) {
    assert.ok(providers.includes(id), `missing ${id}`);
  }
});

test("resolve picks up a known method", () => {
  const e = resolve("pyth.oracle", "price.get");
  assert.equal(e.provider, "pyth.oracle");
  assert.equal(e.method, "price.get");
  assert.ok(e.url.startsWith("https://"));
});

test("resolve throws on unknown method", () => {
  assert.throws(() => resolve("pyth.oracle", "nope"));
});

test("catalog has at least one entry per provider", () => {
  for (const id of listProviders()) {
    const entries = CATALOG.filter((e) => e.provider === id);
    assert.ok(entries.length >= 1);
  }
});
