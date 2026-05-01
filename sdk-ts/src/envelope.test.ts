import { test } from "node:test";
import assert from "node:assert/strict";

import {
  parse402,
  serializeCanonical,
  envelopeHeaders,
  BadEnvelopeError,
  SPEC_VERSION,
  type CanonicalBody,
} from "./envelope.js";

test("envelope basic headers", () => {
  const h = envelopeHeaders({ version: SPEC_VERSION, client: "test", wallet: "w" });
  assert.equal(h["x-402proto-version"], "0.1");
  assert.equal(h["x-402proto-wallet"], "w");
  assert.ok(!("x-402proto-max-price" in h));
});

test("envelope with max price", () => {
  const h = envelopeHeaders({ version: "0.1", client: "x", wallet: "w", maxPrice: 0.005 });
  assert.equal(h["x-402proto-max-price"], "0.005000");
});

test("canonical body has 11 lines, no trailing newline", () => {
  const cb: CanonicalBody = {
    provider: "pyth.oracle",
    method: "price.get",
    price: "0.001",
    currency: "USDC",
    recipient: "r",
    chain: "solana-mainnet",
    quoteId: "q1",
    nonce: "n1",
    wallet: "w",
    ttlExpiresAt: 1_747_066_412,
  };
  const body = new TextDecoder().decode(serializeCanonical(cb));
  const lines = body.split("\n");
  assert.equal(lines.length, 11);
  assert.equal(lines[0], "402proto/0.1");
  assert.ok(!body.endsWith("\n"));
});

test("parse402 reads complete envelope", () => {
  const headers: Record<string, string> = {
    "x-402proto-version": "0.1",
    "x-402proto-provider": "pyth.oracle",
    "x-402proto-method": "price.get",
    "x-402proto-price": "0.001",
    "x-402proto-currency": "USDC",
    "x-402proto-recipient": "r",
    "x-402proto-ttl": "12",
    "x-402proto-chain": "solana-mainnet",
    "x-402proto-quote-id": "q1",
    "x-402proto-nonce": "n1",
  };
  const q = parse402(headers);
  assert.equal(q.provider, "pyth.oracle");
  assert.equal(q.price, 0.001);
  assert.equal(q.ttlSeconds, 12);
});

test("parse402 throws on missing required header", () => {
  assert.throws(() => parse402({ "x-402proto-version": "0.1" }), BadEnvelopeError);
});

test("parse402 is case-insensitive", () => {
  const headers: Record<string, string> = {
    "X-402proto-Version": "0.1",
    "X-402PROTO-PROVIDER": "pyth.oracle",
    "x-402proto-method": "price.get",
    "x-402proto-price": "0.001",
    "x-402proto-currency": "USDC",
    "x-402proto-recipient": "r",
    "x-402proto-ttl": "12",
    "x-402proto-chain": "solana-mainnet",
    "x-402proto-quote-id": "q1",
    "x-402proto-nonce": "n1",
  };
  const q = parse402(headers);
  assert.equal(q.provider, "pyth.oracle");
});
