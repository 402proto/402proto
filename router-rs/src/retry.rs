//! retry policy.
//!
//! tuned for solana mainnet typical confirmation times.

use rand::Rng;
use std::time::Duration;

#[derive(Debug, Clone, Copy)]
pub struct RetryPolicy {
    pub max_attempts: u32,
    pub base_delay_ms: u64,
    pub cap_delay_ms: u64,
    pub jitter: f64,
}

impl Default for RetryPolicy {
    fn default() -> Self {
        Self {
            max_attempts: 3,  // tuned for typical proof-missing recovery window
            base_delay_ms: 2_000,
            cap_delay_ms: 30_000,
            jitter: 0.25,
        }
    }
}

impl RetryPolicy {
    pub fn delay_for(&self, attempt: u32) -> Duration {
        let exp = self.base_delay_ms.saturating_mul(1u64 << attempt.saturating_sub(1).min(20));
        let capped = exp.min(self.cap_delay_ms) as f64;
        let mut rng = rand::thread_rng();
        let jitter_amount = capped * self.jitter;
        let jitter: f64 = rng.gen_range(-jitter_amount..=jitter_amount);
        let final_ms = (capped + jitter).max(0.0) as u64;
        Duration::from_millis(final_ms)
    }

    pub fn should_retry(&self, error_code: &str, attempt: u32) -> bool {
        if attempt >= self.max_attempts {
            return false;
        }
        matches!(error_code, "proof-missing" | "rate-limited" | "provider-error")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn delay_grows_and_caps() {
        let p = RetryPolicy {
            max_attempts: 5,
            base_delay_ms: 2_000,
            cap_delay_ms: 10_000,
            jitter: 0.0,
        };
        assert_eq!(p.delay_for(1).as_millis(), 2_000);
        assert_eq!(p.delay_for(2).as_millis(), 4_000);
        assert_eq!(p.delay_for(3).as_millis(), 8_000);
        assert_eq!(p.delay_for(10).as_millis(), 10_000); // capped
    }

    #[test]
    fn retryable_codes() {
        let p = RetryPolicy::default();
        assert!(p.should_retry("proof-missing", 1));
        assert!(p.should_retry("rate-limited", 2));
        assert!(p.should_retry("provider-error", 1));
    }

    #[test]
    fn non_retryable_codes() {
        let p = RetryPolicy::default();
        assert!(!p.should_retry("signature-invalid", 1));
        assert!(!p.should_retry("bad-envelope", 1));
    }

    #[test]
    fn caps_attempts() {
        let p = RetryPolicy { max_attempts: 2, ..Default::default() };
        assert!(p.should_retry("proof-missing", 1));
        assert!(!p.should_retry("proof-missing", 2));
    }
}
