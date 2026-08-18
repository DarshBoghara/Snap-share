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


_redis_pool: redis.ConnectionPool | None = None
_mock_redis_instance: MockRedis | None = None


def get_redis_pool() -> redis.ConnectionPool:
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = redis.ConnectionPool.from_url(
            settings.get_redis_url(),
            decode_responses=True,
            max_connections=50
        )
    return _redis_pool


async def get_redis() -> AsyncGenerator[redis.Redis | MockRedis, None]:
    global _mock_redis_instance
    try:
        pool = get_redis_pool()
        client = redis.Redis(connection_pool=pool)
        await client.ping()
        yield client
    except Exception as e:
        logger.debug(f"Using MockRedis fallback for local presence state: {e}")
        if _mock_redis_instance is None:
            _mock_redis_instance = MockRedis()
        yield _mock_redis_instance
