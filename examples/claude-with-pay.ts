/**
 * wire claude completion through 402proto.
 *
 * usage:
 *   export PROTO402_WALLET=<base58 secret key>
 *   tsx examples/claude-with-pay.ts
 */
import { Client } from "@402proto/sdk";

async function main() {
  const wallet = process.env.PROTO402_WALLET;
  if (!wallet) {
    console.error("PROTO402_WALLET is required");
    process.exit(1);
  }

  const client = new Client({ wallet, cap: "5 USDC/day" });

  const quote = await client.call({
    provider: "claude.completion",
    method: "messages.create",
    params: {
      model: "claude-3-7-sonnet",
      prompt: "explain http 402 in one sentence to a backend dev",
    },
    maxPrice: 0.05,
  });

  console.log("claude says:", quote.payload);
  console.log("settled tx:", quote.txSignature.slice(0, 12) + "...");
  console.log("spent:", quote.priceUsdc, "USDC");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
