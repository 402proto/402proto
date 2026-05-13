/**
 * http transport — same JSON-RPC envelope as stdio, served on a TCP port.
 *
 * POST any path with a JSON-RPC body. health probes return 200 on GET /healthz.
 * CORS is open by default so browser-based mcp clients can connect; lock it down
 * upstream with a reverse proxy when needed.
 */
import http from "node:http";

import type { Server } from "./server.js";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string };
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Max-Age": "86400",
};

export function startHttp(server: Server, port: number, host = "0.0.0.0"): http.Server {
  const srv = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS);
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/healthz") {
      res.writeHead(200, { "content-type": "text/plain", ...CORS });
      res.end("ok\n");
      return;
    }

    if (req.method !== "POST") {
      res.writeHead(405, { allow: "POST, OPTIONS", ...CORS });
      res.end();
      return;
    }

    let body = "";
    req.setEncoding("utf-8");
    for await (const chunk of req) body += chunk;

    let payload: JsonRpcRequest;
    try {
      payload = JSON.parse(body) as JsonRpcRequest;
    } catch {
      res.writeHead(400, { "content-type": "application/json", ...CORS });
      res.end(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }));
      return;
    }

    const resp = await handle(server, payload);
    res.writeHead(200, { "content-type": "application/json", ...CORS });
    res.end(JSON.stringify(resp));
  });

  srv.listen(port, host, () => {
    console.error(`402proto-mcp http listening on http://${host}:${port}`);
  });
  return srv;
}

async function handle(server: Server, req: JsonRpcRequest): Promise<JsonRpcResponse> {
  try {
    switch (req.method) {
      case "tools/list":
        return { jsonrpc: "2.0", id: req.id, result: { tools: server.listTools() } };
      case "tools/call": {
        const params = req.params as { name: string; arguments?: Record<string, unknown> } | undefined;
        if (!params?.name) throw new Error("missing tool name");
        const out = await server.callTool(params.name, params.arguments ?? {});
        return { jsonrpc: "2.0", id: req.id, result: out };
      }
      default:
        return {
          jsonrpc: "2.0",
          id: req.id,
          error: { code: -32601, message: `method not found: ${req.method}` },
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { jsonrpc: "2.0", id: req.id, error: { code: -32000, message } };
  }
}
