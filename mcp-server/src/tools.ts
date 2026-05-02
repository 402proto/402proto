/**
 * mcp tool definitions wrapping the 402proto Client.
 */
import { CATALOG, type Endpoint } from "@402proto/sdk";

export interface ToolSpec {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description?: string }>;
    required: string[];
  };
  provider: string;
  method: string;
  endpoint: Endpoint;
}

const SCHEMAS: Record<string, { description: string; inputs: Record<string, string>; required: string[] }> = {
  "pyth.oracle.price.get": {
    description: "fetch a price from the pyth oracle, paid in usdc on solana",
    inputs: { symbol: "trading pair, e.g. SOL/USD" },
    required: ["symbol"],
  },
  "jupiter.quote.quote": {
    description: "get a swap quote on solana",
    inputs: { input: "input token symbol or mint", output: "output token symbol or mint", amount: "input amount in base units" },
    required: ["input", "output", "amount"],
  },
  "jupiter.quote.swap.build": {
    description: "build a swap transaction from a previously fetched quote",
    inputs: { quote: "quote object returned by jupiter.quote.quote" },
    required: ["quote"],
  },
  "birdeye.token.token.meta": {
    description: "fetch token metadata (symbol, name, decimals, volume)",
    inputs: { mint: "spl mint address" },
    required: ["mint"],
  },
  "birdeye.token.token.holders": {
    description: "list top holders of a spl token",
    inputs: { mint: "spl mint address", limit: "max holders to return" },
    required: ["mint"],
  },
  "helius.rpc.getAccountInfo": {
    description: "read solana account info via the helius rpc",
    inputs: { address: "base58 account address" },
    required: ["address"],
  },
  "helius.rpc.sendTransaction": {
    description: "submit a signed solana transaction via helius rpc",
    inputs: { transaction: "base64 encoded transaction" },
    required: ["transaction"],
  },
  "claude.completion.messages.create": {
    description: "call claude via the 402proto envelope",
    inputs: { model: "claude model id", prompt: "user prompt" },
    required: ["model", "prompt"],
  },
  "anthropic.embed.embeddings": {
    description: "compute an embedding via anthropic",
    inputs: { input: "text to embed", model: "embedding model id" },
    required: ["input"],
  },
};

export function listTools(): ToolSpec[] {
  return CATALOG.map((e) => {
    const id = `${e.provider}.${e.method}`;
    const schema = SCHEMAS[id] ?? {
      description: `${e.provider} ${e.method}`,
      inputs: {},
      required: [],
    };
    return {
      name: id.replace(/\./g, "_"),
      description: schema.description + ` (est. ${e.estPriceUsdc} USDC per call)`,
      inputSchema: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(schema.inputs).map(([k, v]) => [k, { type: "string", description: v }])
        ),
        required: schema.required,
      },
      provider: e.provider,
      method: e.method,
      endpoint: e,
    };
  });
}
