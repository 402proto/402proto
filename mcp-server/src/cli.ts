#!/usr/bin/env node
/**
 * 402proto-mcp entry point.
 */
import { Server } from "./server.js";
import { startStdio } from "./transport.js";

function parseFlag(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx > -1 ? process.argv[idx + 1] : process.env[`PROTO402_${name.toUpperCase()}`];
}

function main() {
  const wallet = parseFlag("wallet");
  const cap = parseFlag("cap");
  const rpcUrl = parseFlag("rpc-url");

  if (!wallet) {
    console.error("missing --wallet (or PROTO402_WALLET env)");
    process.exit(1);
  }

  const server = new Server({ wallet, cap, rpcUrl });
  console.error(`402proto-mcp v0.1.0 — ${server.listTools().length} tools registered`);
  startStdio(server);
}

main();
