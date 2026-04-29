//! provider scoring + failover selection.

use crate::catalog::{Catalog, Provider};

/// pick the best provider for a given category, considering health.
/// returns providers in preference order (best first).
pub fn rank<'a>(catalog: &'a Catalog, category: &str) -> Vec<&'a Provider> {
    let mut candidates: Vec<&Provider> = catalog
        .list()
        .into_iter()
        .filter(|p| p.category == category)
        .collect();
    // sort by health first, then by price ascending
    candidates.sort_by(|a, b| {
        let ah = catalog.is_healthy(&a.id);
        let bh = catalog.is_healthy(&b.id);
        match (ah, bh) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a
                .est_price_usdc
                .partial_cmp(&b.est_price_usdc)
                .unwrap_or(std::cmp::Ordering::Equal),
        }
    });
    candidates
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ranks_by_price_when_all_healthy() {
        let c = Catalog::v01_default();
        let r = rank(&c, "llm");
        assert!(!r.is_empty());
        let prices: Vec<f64> = r.iter().map(|p| p.est_price_usdc).collect();
        for w in prices.windows(2) {
            assert!(w[0] <= w[1]);
        }
    }

    #[test]
    fn unhealthy_drop_to_bottom() {
        let c = Catalog::v01_default();
        c.mark_failure("anthropic.embed");
        c.mark_failure("anthropic.embed");
        c.mark_failure("anthropic.embed");
        let r = rank(&c, "llm");
        let last = r.last().unwrap();
        assert_eq!(last.id, "anthropic.embed");
    }
}
