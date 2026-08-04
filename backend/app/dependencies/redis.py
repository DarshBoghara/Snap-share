import logging
from typing import AsyncGenerator
import redis.asyncio as redis
from app.config.settings import settings

logger = logging.getLogger("redis_dep")

class MockRedis:
    """Mock Redis client for local development when Redis server is offline."""
    def __init__(self):
        self._store = {}
        self._sets = {}

    async def sadd(self, key: str, value: str):
        if key not in self._sets:
            self._sets[key] = set()
        self._sets[key].add(value)

    async def srem(self, key: str, value: str):
        if key in self._sets:
            self._sets[key].discard(value)

    async def scard(self, key: str) -> int:
        return len(self._sets.get(key, set()))

    async def set(self, key: str, value: str, ex: int | None = None):
        self._store[key] = value

    async def get(self, key: str):
        return self._store.get(key)

    async def delete(self, key: str):
        self._store.pop(key, None)
        self._sets.pop(key, None)

    async def exists(self, key: str) -> int:
        return 1 if (key in self._store or key in self._sets) else 0

    async def aclose(self):
        pass


async def get_redis() -> AsyncGenerator[redis.Redis | MockRedis, None]:
    try:
        pool = redis.ConnectionPool.from_url(settings.get_redis_url(), decode_responses=True)
        client = redis.Redis(connection_pool=pool)
        # Test connection ping
        await client.ping()
        yield client
        await client.aclose()
    except Exception as e:
        logger.info(f"Using MockRedis fallback for local presence state: {e}")
        yield MockRedis()
