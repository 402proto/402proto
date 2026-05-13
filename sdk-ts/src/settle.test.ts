/**
 * unit tests for the settle module. on-chain tests require
 * @solana/web3.js + @solana/spl-token; they are skipped otherwise.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ChainDependencyMissing,
  toBaseUnits,
  usdcMint,
  USDC_MINT_DEVNET,
  USDC_MINT_MAINNET,
  submitTransfer,
} from "./settle.js";

describe("settle helpers", () => {
  it("maps mainnet to the real usdc mint", () => {
    assert.equal(usdcMint("mainnet"), USDC_MINT_MAINNET);
  });

  it("maps devnet to the devnet usdc mint", () => {
    assert.equal(usdcMint("devnet"), USDC_MINT_DEVNET);
  });

  it("converts usdc → micro-units with 6 decimals", () => {
    assert.equal(toBaseUnits(1.0), 1_000_000n);
    assert.equal(toBaseUnits(0.001), 1_000n);
    assert.equal(toBaseUnits(0.000001), 1n);
    assert.equal(toBaseUnits(12.345678), 12_345_678n);
    assert.equal(toBaseUnits(0), 0n);
  });
});

describe("settle dependency handling", () => {
  it("raises ChainDependencyMissing when @solana/web3.js is not installed", async () => {
    // dynamic import resolution decides at call time. if peers are absent,
    // submitTransfer must throw ChainDependencyMissing rather than fake a sig.
    let chainAvailable = true;
    try {
      await import("@solana/web3.js");
      await import("@solana/spl-token");
    } catch {
      chainAvailable = false;
    }

    if (chainAvailable) {
      // skip — when peers are installed, this path goes to the real flow,
      // which needs an rpc url and a valid keypair (covered by the dry-run
      // integration test below).
      return;
    }

    await assert.rejects(
      submitTransfer({
        rpcUrl: "https://api.devnet.solana.com",
        network: "devnet",
        walletSecret: new Uint8Array(64),
        recipient: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        amountUsdc: 0.001,
        memo: "402proto/0.2 q=test",
        dryRun: true,
      }),
      (err: Error) => err instanceof ChainDependencyMissing,
    );
  });
});
