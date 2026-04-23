//! 402proto envelope: parse + build x-402proto-* headers, canonical body.

use crate::error::RouterError;
use crate::SPEC_VERSION;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub type Headers = HashMap<String, String>;

/// request-side envelope from a client.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Envelope {
    pub version: String,
    pub client: String,
    pub wallet: String,
    pub max_price: Option<f64>,
    pub idempotency_key: Option<String>,
}

impl Envelope {
    pub fn parse(headers: &Headers) -> Result<Self, RouterError> {
        Ok(Self {
            version: required(headers, "x-402proto-version")?,
            client: required(headers, "x-402proto-client")?,
            wallet: required(headers, "x-402proto-wallet")?,
            max_price: optional(headers, "x-402proto-max-price")
                .map(|s| s.parse::<f64>())
                .transpose()
                .map_err(|_| RouterError::BadEnvelope("max-price not a number".into()))?,
            idempotency_key: optional(headers, "x-402proto-idempotency-key"),
        })
    }
}

/// 402 response from a provider, parsed.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Quote402 {
    pub version: String,
    pub provider: String,
    pub method: String,
    pub price: f64,
    pub currency: String,
    pub recipient: String,
    pub ttl_seconds: u32,
    pub chain: String,
    pub quote_id: String,
    pub nonce: String,
}

impl Quote402 {
    pub fn parse(headers: &Headers) -> Result<Self, RouterError> {
        Ok(Self {
            version: required(headers, "x-402proto-version")?,
            provider: required(headers, "x-402proto-provider")?,
            method: required(headers, "x-402proto-method")?,
            price: required(headers, "x-402proto-price")?
                .parse()
                .map_err(|_| RouterError::BadEnvelope("price not numeric".into()))?,
            currency: required(headers, "x-402proto-currency")?,
            recipient: required(headers, "x-402proto-recipient")?,
            ttl_seconds: required(headers, "x-402proto-ttl")?
                .parse()
                .map_err(|_| RouterError::BadEnvelope("ttl not numeric".into()))?,
            chain: required(headers, "x-402proto-chain")?,
            quote_id: required(headers, "x-402proto-quote-id")?,
            nonce: required(headers, "x-402proto-nonce")?,
        })
    }
}

/// canonical body — the exact bytes the wallet signs.
#[derive(Debug, Clone)]
pub struct CanonicalBody {
    pub provider: String,
    pub method: String,
    pub price: String,
    pub currency: String,
    pub recipient: String,
    pub chain: String,
    pub quote_id: String,
    pub nonce: String,
    pub wallet: String,
    pub ttl_expires_at: u64,
}

impl CanonicalBody {
    pub fn serialize(&self) -> Vec<u8> {
        let lines = [
            format!("402proto/{SPEC_VERSION}"),
            format!("provider={}", self.provider),
            format!("method={}", self.method),
            format!("price={}", self.price),
            format!("currency={}", self.currency),
            format!("recipient={}", self.recipient),
            format!("chain={}", self.chain),
            format!("quote_id={}", self.quote_id),
            format!("nonce={}", self.nonce),
            format!("wallet={}", self.wallet),
            format!("ttl_expires_at={}", self.ttl_expires_at),
        ];
        lines.join("\n").into_bytes()
    }
}

fn required(h: &Headers, name: &str) -> Result<String, RouterError> {
    let key = name.to_lowercase();
    h.get(&key)
        .or_else(|| h.iter().find(|(k, _)| k.to_lowercase() == key).map(|(_, v)| v))
        .cloned()
        .ok_or_else(|| RouterError::BadEnvelope(format!("missing header: {name}")))
}

fn optional(h: &Headers, name: &str) -> Option<String> {
    let key = name.to_lowercase();
    h.get(&key)
        .or_else(|| h.iter().find(|(k, _)| k.to_lowercase() == key).map(|(_, v)| v))
        .cloned()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn h(pairs: &[(&str, &str)]) -> Headers {
        pairs
            .iter()
            .map(|(k, v)| (k.to_lowercase(), v.to_string()))
            .collect()
    }

    #[test]
    fn canonical_body_layout() {
        let cb = CanonicalBody {
            provider: "pyth.oracle".into(),
            method: "price.get".into(),
            price: "0.001".into(),
            currency: "USDC".into(),
            recipient: "r".into(),
            chain: "solana-mainnet".into(),
            quote_id: "q1".into(),
            nonce: "n1".into(),
            wallet: "w".into(),
            ttl_expires_at: 1_747_066_412,
        };
        let body = cb.serialize();
        let s = String::from_utf8(body).unwrap();
        let lines: Vec<&str> = s.split('\n').collect();
        assert_eq!(lines.len(), 11);
        assert_eq!(lines[0], "402proto/0.1");
        assert!(lines[10].starts_with("ttl_expires_at="));
    }

    #[test]
    fn envelope_parses() {
        let headers = h(&[
            ("x-402proto-version", "0.1"),
            ("x-402proto-client", "proto402-py/0.1.0"),
            ("x-402proto-wallet", "7xKp"),
        ]);
        let env = Envelope::parse(&headers).unwrap();
        assert_eq!(env.version, "0.1");
        assert_eq!(env.wallet, "7xKp");
    }

    #[test]
    fn envelope_missing_wallet_errors() {
        let headers = h(&[
            ("x-402proto-version", "0.1"),
            ("x-402proto-client", "proto402-py/0.1.0"),
        ]);
        assert!(matches!(
            Envelope::parse(&headers).unwrap_err(),
            RouterError::BadEnvelope(_)
        ));
    }

    #[test]
    fn quote_parses() {
        let headers = h(&[
            ("x-402proto-version", "0.1"),
            ("x-402proto-provider", "pyth.oracle"),
            ("x-402proto-method", "price.get"),
            ("x-402proto-price", "0.001"),
            ("x-402proto-currency", "USDC"),
            ("x-402proto-recipient", "r"),
            ("x-402proto-ttl", "12"),
            ("x-402proto-chain", "solana-mainnet"),
            ("x-402proto-quote-id", "q1"),
            ("x-402proto-nonce", "n1"),
        ]);
        let q = Quote402::parse(&headers).unwrap();
        assert_eq!(q.provider, "pyth.oracle");
        assert!((q.price - 0.001).abs() < 1e-9);
        assert_eq!(q.ttl_seconds, 12);
    }
}
