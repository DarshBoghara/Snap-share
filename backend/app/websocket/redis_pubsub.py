import asyncio
import json
import logging
import uuid
import redis.asyncio as redis
from app.config.settings import settings
from app.websocket.connection_manager import manager

logger = logging.getLogger("redis_pubsub")
PUBSUB_CHANNEL = "snapchat_ws_events"


class RedisPubSubManager:
    def __init__(self):
        self.redis_client = None
        self.pubsub = None
        self.listen_task: asyncio.Task | None = None
        self.is_connected = False

    async def start(self):
        try:
            self.redis_client = redis.Redis.from_url(settings.get_redis_url(), decode_responses=True)
            self.pubsub = self.redis_client.pubsub()
            await self.pubsub.subscribe(PUBSUB_CHANNEL)
            self.listen_task = asyncio.create_task(self._listen())
            self.is_connected = True
            logger.info("Redis PubSub listener started successfully.")
        except Exception as e:
            logger.warning(f"Redis not available ({e}). Falling back to local in-memory WebSocket broadcaster.")
            self.is_connected = False

    async def stop(self):
        if self.listen_task:
            self.listen_task.cancel()
        if self.pubsub:
            try:
                await self.pubsub.unsubscribe(PUBSUB_CHANNEL)
            except Exception:
                pass
        if self.redis_client:
            try:
                await self.redis_client.aclose()
            except Exception:
                pass

    async def publish_event(self, target_user_ids: list[uuid.UUID], event_data: dict):
        if self.is_connected and self.redis_client:
            try:
                message = {
                    "targets": [str(uid) for uid in target_user_ids],
                    "payload": event_data
                }
                await self.redis_client.publish(PUBSUB_CHANNEL, json.dumps(message, default=str))
                return
            except Exception as e:
                logger.warning(f"Failed to publish via Redis ({e}), using in-memory manager fallback.")
        
        # Fallback: direct in-memory connection manager dispatch
        await manager.broadcast_event(target_user_ids, event_data)

    async def _listen(self):
        try:
            async for msg in self.pubsub.listen():
                if msg and msg["type"] == "message":
                    data = json.loads(msg["data"])
                    targets = [uuid.UUID(uid) for uid in data.get("targets", [])]
                    payload = data.get("payload", {})
                    await manager.broadcast_event(targets, payload)
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error in Redis PubSub listener: {e}")


pubsub_manager = RedisPubSubManager()
