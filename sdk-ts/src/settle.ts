/**
 * solana usdc spl-transfer with memo, paired with sdk-py/proto402/settle.py.
 *
 * v0.2: real on-chain submission via @solana/web3.js + @solana/spl-token.
 * those packages are peer dependencies — install with
 *   npm i @solana/web3.js @solana/spl-token
 * the client throws ChainDependencyMissing if they are not available
 * (previously it silently returned a fake signature).
 */
import bs58 from "bs58";

export const USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDC_MINT_DEVNET = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr";
export const MEMO_PROGRAM = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

export function usdcMint(network: "mainnet" | "devnet"): string {
  return network === "mainnet" ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;
}

export function toBaseUnits(amountUsdc: number): bigint {
  return BigInt(Math.round(amountUsdc * 1_000_000));
}

export class ChainDependencyMissing extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "ChainDependencyMissing";
  }
}

export interface SubmitTransferOpts {
  rpcUrl: string;
  network: "mainnet" | "devnet";
  /** 64-byte solana secret key (ed25519 secret + public) */
  walletSecret: Uint8Array;
  recipient: string;
  amountUsdc: number;
  memo: string;
  /** build and sign locally, do not submit to the rpc. for tests / CI. */
  dryRun?: boolean;
  /** wait for confirmed commitment after submission (default true). */
  confirm?: boolean;
}

export async function submitTransfer(opts: SubmitTransferOpts): Promise<string> {
  let web3: typeof import("@solana/web3.js");
  let splToken: typeof import("@solana/spl-token");
  try {
    web3 = await import("@solana/web3.js");
    splToken = await import("@solana/spl-token");
  } catch {
    throw new ChainDependencyMissing(
      "settlement requires @solana/web3.js + @solana/spl-token. " +
        "install with: npm i @solana/web3.js @solana/spl-token",
    );
  }

  const {
    Connection,
    Keypair,
    PublicKey,
    TransactionMessage,
    VersionedTransaction,
    TransactionInstruction,
  } = web3;
  const { getAssociatedTokenAddress, createTransferCheckedInstruction } = splToken;

  const sender = Keypair.fromSecretKey(opts.walletSecret);
  const receiver = new PublicKey(opts.recipient);
  const mint = new PublicKey(usdcMint(opts.network));

  const fromAta = await getAssociatedTokenAddress(mint, sender.publicKey);
  const toAta = await getAssociatedTokenAddress(mint, receiver);

  const transferIx = createTransferCheckedInstruction(
    fromAta,
    mint,
    toAta,
    sender.publicKey,
    toBaseUnits(opts.amountUsdc),
    6,
  );

  const memoIx = new TransactionInstruction({
    keys: [],
    programId: new PublicKey(MEMO_PROGRAM),
    data: Buffer.from(opts.memo, "utf-8"),
  });

  const conn = new Connection(opts.rpcUrl, "confirmed");
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();

  const msg = new TransactionMessage({
    payerKey: sender.publicKey,
    recentBlockhash: blockhash,
    instructions: [transferIx, memoIx],
  }).compileToV0Message();
  const tx = new VersionedTransaction(msg);
  tx.sign([sender]);

  const sigBytes = tx.signatures[0];
  const sig = bs58.encode(sigBytes);

  if (opts.dryRun) return sig;

  await conn.sendTransaction(tx, { skipPreflight: false, maxRetries: 3 });
  if (opts.confirm !== false) {
    await conn.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      "confirmed",
    );
  }
  return sig;
}
