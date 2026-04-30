/**
 * ed25519 signing helpers (noble curves).
 */
import { ed25519 } from "@noble/curves/ed25519";
import bs58 from "bs58";

export function sign(canonicalBody: Uint8Array, secretKey: Uint8Array): string {
  // noble takes raw 32-byte seed
  const seed = secretKey.length >= 32 ? secretKey.slice(0, 32) : secretKey;
  const sig = ed25519.sign(canonicalBody, seed);
  return bs58.encode(sig);
}

export function verify(canonicalBody: Uint8Array, signatureB58: string, pubkeyB58: string): boolean {
  try {
    const sig = bs58.decode(signatureB58);
    const pk = bs58.decode(pubkeyB58);
    return ed25519.verify(sig, canonicalBody, pk);
  } catch {
    return false;
  }
}

export function derivePubkey(secretKey: Uint8Array): string {
  const seed = secretKey.length >= 32 ? secretKey.slice(0, 32) : secretKey;
  const pub = ed25519.getPublicKey(seed);
  return bs58.encode(pub);
}
