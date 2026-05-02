/**
 * mcp server bootstrap.
 *
 * v0.1 ships a stdio-only server. http transport in v0.2.
 */
import { Client } from "@402proto/sdk";

import { listTools, type ToolSpec } from "./tools.js";

export interface ServerConfig {
  wallet: string;
  cap?: string;
  rpcUrl?: string;
}

export class Server {
  private client: Client;
  private tools: ToolSpec[];

  constructor(cfg: ServerConfig) {
    this.client = new Client({ wallet: cfg.wallet, cap: cfg.cap, rpcUrl: cfg.rpcUrl });
    this.tools = listTools();
  }

  /** list tool specs in mcp tool/list shape. */
  listTools() {
    return this.tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
  }

  /** invoke a tool by name with arguments. */
  async callTool(name: string, args: Record<string, unknown>) {
    const tool = this.tools.find((t) => t.name === name);
    if (!tool) throw new Error(`unknown tool: ${name}`);

    const quote = await this.client.call({
      provider: tool.provider,
      method: tool.method,
      params: args,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(quote.payload, null, 2) }],
      _meta: {
        tx: quote.txSignature,
        priceUsdc: quote.priceUsdc,
        latencyMs: quote.latencyMs,
      },
    };
  }
}
