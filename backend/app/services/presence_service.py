import uuid
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession
from app.config.settings import settings
from app.repositories.user_repo import UserRepository


class PresenceService:
    def __init__(self, redis_client: redis.Redis, db: AsyncSession | None = None):
        self.redis = redis_client
        self.db = db

    async def set_user_online(self, user_id: uuid.UUID, socket_id: str) -> None:
        user_key = f"online_users:{user_id}"
        socket_key = f"user_sockets:{user_id}"
        
        # Add socket connection
        await self.redis.sadd(socket_key, socket_id)
        # Set user presence with expiration heartbeat (60s)
        await self.redis.set(user_key, "1", ex=60)

        if self.db:
            repo = UserRepository(self.db)
            await repo.update_online_status(user_id, is_online=True)

    async def set_user_offline(self, user_id: uuid.UUID, socket_id: str) -> bool:
        """Removes a socket. Returns True if user has no remaining active sockets (is fully offline)."""
        socket_key = f"user_sockets:{user_id}"
        user_key = f"online_users:{user_id}"

        await self.redis.srem(socket_key, socket_id)
        active_sockets_count = await self.redis.scard(socket_key)

        if active_sockets_count == 0:
            await self.redis.delete(user_key)
            if self.db:
                repo = UserRepository(self.db)
                await repo.update_online_status(user_id, is_online=False)
            return True
        return False

    async def refresh_heartbeat(self, user_id: uuid.UUID) -> None:
        user_key = f"online_users:{user_id}"
        await self.redis.set(user_key, "1", ex=60)

    async def is_user_online(self, user_id: uuid.UUID) -> bool:
        user_key = f"online_users:{user_id}"
        exists = await self.redis.exists(user_key)
        return exists > 0
