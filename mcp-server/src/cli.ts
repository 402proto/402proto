#!/usr/bin/env node
/**
 * 402proto-mcp entry point.
 *
 * usage:
 *   402proto-mcp --wallet $PROTO402_WALLET                # stdio (default)
 *   402proto-mcp --wallet $PROTO402_WALLET --http :8080   # http transport
 *   402proto-mcp --wallet $PROTO402_WALLET --http 8080    # short form
 */
import { Server } from "./server.js";
import { startStdio } from "./transport.js";
import { startHttp } from "./transport-http.js";

function parseFlag(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx > -1 ? process.argv[idx + 1] : process.env[`PROTO402_${name.toUpperCase()}`];
}

function parsePort(spec: string): { host: string; port: number } {
  // accept ":8080" / "8080" / "127.0.0.1:8080" / "0.0.0.0:8080"
  const trimmed = spec.startsWith(":") ? spec.slice(1) : spec;
  const parts = trimmed.split(":");
  if (parts.length === 1) {
    return { host: "0.0.0.0", port: Number(parts[0]) };
  }
  return { host: parts[0], port: Number(parts[1]) };
}

function main() {
  const wallet = parseFlag("wallet");
  const cap = parseFlag("cap");
  const rpcUrl = parseFlag("rpc-url");
  const httpSpec = parseFlag("http");

  if (!wallet) {
    console.error("missing --wallet (or PROTO402_WALLET env)");
    process.exit(1);
  }

  const server = new Server({ wallet, cap, rpcUrl });

  if (httpSpec) {
    const { host, port } = parsePort(httpSpec);
    if (!Number.isFinite(port) || port <= 0 || port > 65535) {
      console.error(`invalid --http target: ${httpSpec}`);
      process.exit(1);
    }
    console.error(`402proto-mcp v0.2.0 — ${server.listTools().length} tools registered (http)`);
    startHttp(server, port, host);
  } else {
    console.error(`402proto-mcp v0.2.0 — ${server.listTools().length} tools registered (stdio)`);
    startStdio(server);
  }
}

main();
