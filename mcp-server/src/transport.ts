/**
 * stdio transport. v0.1 minimal — handles `tools/list` and `tools/call` jsonrpc methods.
 */
import { Server } from "./server.js";

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

export function startStdio(server: Server) {
  process.stdin.setEncoding("utf-8");
  let buf = "";

  process.stdin.on("data", async (chunk) => {
    buf += chunk;
    const messages = buf.split("\n");
    buf = messages.pop() ?? "";

    for (const raw of messages) {
      if (!raw.trim()) continue;
      let req: JsonRpcRequest;
      try {
        req = JSON.parse(raw) as JsonRpcRequest;
      } catch {
        continue;
      }
      const resp = await handle(server, req);
      process.stdout.write(JSON.stringify(resp) + "\n");
    }
  });
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
