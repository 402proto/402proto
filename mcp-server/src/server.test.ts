import { test } from "node:test";
import assert from "node:assert/strict";

import { Server } from "./server.js";

const FAKE_WALLET = "4Nd6N8K8u3rGN8XaUz4F1eUVnFRrXz4qa9MqRZyQ9vRk5Pj";

test("server lists tools after bootstrap", () => {
  const s = new Server({ wallet: FAKE_WALLET });
  const tools = s.listTools();
  assert.ok(tools.length >= 6);
  for (const t of tools) {
    assert.ok(t.name.length > 0);
    assert.equal(t.inputSchema.type, "object");
    assert.ok(t.description.includes("USDC"));
  }
});

test("tool names use underscores not dots (mcp-safe)", () => {
  const s = new Server({ wallet: FAKE_WALLET });
  for (const t of s.listTools()) {
    assert.ok(!t.name.includes("."), `tool name has dot: ${t.name}`);
  }
});

test("tool descriptions surface est. price", () => {
  const s = new Server({ wallet: FAKE_WALLET });
  const pyth = s.listTools().find((t) => t.name.startsWith("pyth_oracle"));
  assert.ok(pyth);
  assert.match(pyth!.description, /USDC/);
});
