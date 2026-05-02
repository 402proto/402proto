//! provider catalog.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Provider {
    pub id: String,
    pub category: String,
    pub base_url: String,
    pub methods: Vec<String>,
    pub est_price_usdc: f64,
}

#[derive(Debug)]
pub struct ProviderHealth {
    pub failures_recent: u32,
    pub last_failure: Option<Instant>,
    pub unhealthy_until: Option<Instant>,
}

impl Default for ProviderHealth {
    fn default() -> Self {
        Self {
            failures_recent: 0,
            last_failure: None,
            unhealthy_until: None,
        }
    }
}

#[derive(Debug)]
pub struct Catalog {
    providers: HashMap<String, Provider>,
    health: Mutex<HashMap<String, ProviderHealth>>,
    unhealthy_window: Duration,
    failure_threshold: u32,
}

impl Catalog {
    pub fn new(providers: Vec<Provider>) -> Self {
        let map = providers.into_iter().map(|p| (p.id.clone(), p)).collect();
        Self {
            providers: map,
            health: Mutex::new(HashMap::new()),
            unhealthy_window: Duration::from_secs(60),
            failure_threshold: 3,
        }
    }

    pub fn v01_default() -> Self {
        Self::new(vec![
            Provider {
                id: "pyth.oracle".into(),
                category: "oracle".into(),
                base_url: "https://api.pyth.example.com".into(),
                methods: vec!["price.get".into()],
                est_price_usdc: 0.001,
            },
            Provider {
                id: "jupiter.quote".into(),
                category: "dex".into(),
                base_url: "https://api.jupiter.example.com".into(),
                methods: vec!["quote".into(), "swap.build".into()],
                est_price_usdc: 0.005,
            },
            Provider {
                id: "birdeye.token".into(),
                category: "data".into(),
                base_url: "https://api.birdeye.example.com".into(),
                methods: vec!["token.meta".into(), "token.holders".into()],
                est_price_usdc: 0.002,
            },
            Provider {
                id: "helius.rpc".into(),
                category: "rpc".into(),
                base_url: "https://rpc.helius.example.com".into(),
                methods: vec!["getAccountInfo".into(), "sendTransaction".into()],
                est_price_usdc: 0.0008,
            },
            Provider {
                id: "claude.completion".into(),
                category: "llm".into(),
                base_url: "https://api.anthropic.example.com".into(),
                methods: vec!["messages.create".into()],
                est_price_usdc: 0.018,
            },
            Provider {
                id: "anthropic.embed".into(),
                category: "llm".into(),
                base_url: "https://api.anthropic.example.com".into(),
                methods: vec!["embeddings".into()],
                est_price_usdc: 0.0004,
            },
        ])
    }

    pub fn get(&self, id: &str) -> Option<&Provider> {
        self.providers.get(id)
    }

    pub fn list(&self) -> Vec<&Provider> {
        self.providers.values().collect()
    }

    pub fn mark_failure(&self, provider_id: &str) {
        let mut h = self.health.lock().unwrap();
        let entry = h.entry(provider_id.to_string()).or_default();
        entry.failures_recent += 1;
        entry.last_failure = Some(Instant::now());
        if entry.failures_recent >= self.failure_threshold {
            entry.unhealthy_until = Some(Instant::now() + self.unhealthy_window);
            entry.failures_recent = 0;
        }
    }

    pub fn mark_success(&self, provider_id: &str) {
        let mut h = self.health.lock().unwrap();
        if let Some(entry) = h.get_mut(provider_id) {
            entry.failures_recent = 0;
            entry.unhealthy_until = None;
        }
    }

    pub fn is_healthy(&self, provider_id: &str) -> bool {
        let h = self.health.lock().unwrap();
        match h.get(provider_id) {
            None => true,
            Some(state) => state
                .unhealthy_until
                .map(|until| Instant::now() > until)
                .unwrap_or(true),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_catalog_has_six_providers() {
        let c = Catalog::v01_default();
        assert_eq!(c.list().len(), 6);
        assert!(c.get("pyth.oracle").is_some());
        assert!(c.get("jupiter.quote").is_some());
    }

    #[test]
    fn list_returns_all_providers() {
        let c = Catalog::v01_default();
        assert!(c.list().iter().any(|p| p.id == "helius.rpc"));
    }

    #[test]
    fn unknown_provider_is_none() {
        let c = Catalog::v01_default();
        assert!(c.get("nope").is_none());
    }

    #[test]
    fn marks_unhealthy_after_failures() {
        let c = Catalog::v01_default();
        c.mark_failure("pyth.oracle");
        c.mark_failure("pyth.oracle");
        c.mark_failure("pyth.oracle"); // hits threshold
        assert!(!c.is_healthy("pyth.oracle"));
    }

    #[test]
    fn success_clears_failures() {
        let c = Catalog::v01_default();
        c.mark_failure("pyth.oracle");
        c.mark_failure("pyth.oracle");
        c.mark_success("pyth.oracle");
        assert!(c.is_healthy("pyth.oracle"));
    }
}
