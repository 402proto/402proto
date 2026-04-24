"""retry policy for 402proto client.

policy follows spec/errors.md recovery semantics.
"""
from __future__ import annotations

import random
import time
from dataclasses import dataclass


@dataclass(frozen=True)
class RetryPolicy:
    max_attempts: int = 3
    base_delay_s: float = 2.0
    cap_delay_s: float = 30.0
    jitter: float = 0.25  # fraction of delay added/subtracted randomly

    def delay_for(self, attempt: int) -> float:
        """exponential backoff with jitter. attempt is 1-indexed."""
        raw = min(self.cap_delay_s, self.base_delay_s * (2 ** (attempt - 1)))
        jitter_amount = raw * self.jitter
        return raw + random.uniform(-jitter_amount, jitter_amount)

    def should_retry(self, error_code: str, attempt: int) -> bool:
        if attempt >= self.max_attempts:
            return False
        return error_code in {"proof-missing", "rate-limited", "provider-error"}


def sleep_with_jitter(seconds: float) -> None:
    time.sleep(max(0.0, seconds))
