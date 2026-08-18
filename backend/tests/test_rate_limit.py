import pytest
from app.middleware.rate_limiter import RateLimiter


def test_rate_limiter_exceeds_threshold():
    limiter = RateLimiter(requests_per_minute=3)
    client_ip = "192.168.1.100"

    assert not limiter.is_rate_limited(client_ip)  # Request 1: OK
    assert not limiter.is_rate_limited(client_ip)  # Request 2: OK
    assert not limiter.is_rate_limited(client_ip)  # Request 3: OK
    assert limiter.is_rate_limited(client_ip)      # Request 4: Blocked (Rate Limited)
