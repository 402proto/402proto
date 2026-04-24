"""retry policy tests."""
from __future__ import annotations

from proto402.retry import RetryPolicy


def test_retryable_codes():
    p = RetryPolicy()
    assert p.should_retry("proof-missing", attempt=1)
    assert p.should_retry("rate-limited", attempt=1)
    assert p.should_retry("provider-error", attempt=2)


def test_non_retryable_codes():
    p = RetryPolicy()
    assert not p.should_retry("signature-invalid", attempt=1)
    assert not p.should_retry("bad-envelope", attempt=1)
    assert not p.should_retry("proof-recipient-mismatch", attempt=1)


def test_max_attempts_caps_retry():
    p = RetryPolicy(max_attempts=2)
    assert p.should_retry("proof-missing", attempt=1)
    assert not p.should_retry("proof-missing", attempt=2)


def test_delay_grows_exponentially_and_caps():
    p = RetryPolicy(base_delay_s=2.0, cap_delay_s=10.0, jitter=0.0)
    assert p.delay_for(1) == 2.0
    assert p.delay_for(2) == 4.0
    assert p.delay_for(3) == 8.0
    assert p.delay_for(10) == 10.0   # capped


def test_delay_jitter_within_bounds():
    p = RetryPolicy(base_delay_s=4.0, cap_delay_s=100.0, jitter=0.25)
    for _ in range(50):
        d = p.delay_for(1)
        assert 3.0 <= d <= 5.0
