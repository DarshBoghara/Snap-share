import time
import logging
from collections import defaultdict
from fastapi import Request, HTTPException, status

logger = logging.getLogger("rate_limiter")


class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: dict[str, list[float]] = defaultdict(list)

    def is_rate_limited(self, client_ip: str) -> bool:
        now = time.time()
        window_start = now - 60
        # Purge timestamps older than 60 seconds
        self.requests[client_ip] = [t for t in self.requests[client_ip] if t > window_start]
        
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            return True
        self.requests[client_ip].append(now)
        return False


# Rate limiter instances for sensitive routes
auth_rate_limiter = RateLimiter(requests_per_minute=20)
search_rate_limiter = RateLimiter(requests_per_minute=40)
message_rate_limiter = RateLimiter(requests_per_minute=60)


async def check_auth_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    if auth_rate_limiter.is_rate_limited(client_ip):
        logger.warning(f"Auth rate limit exceeded for IP {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication requests. Please wait a minute before trying again."
        )


async def check_search_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    if search_rate_limiter.is_rate_limited(client_ip):
        logger.warning(f"Search rate limit exceeded for IP {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many search requests. Please slow down."
        )
