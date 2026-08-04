import json
import logging
import uuid
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger("websocket")


class ConnectionManager:
    def __init__(self):
        # Maps user_id (UUID) -> Set of active WebSocket connections (multi-device support)
        self.active_connections: Dict[uuid.UUID, Set[WebSocket]] = {}

    async def connect(self, user_id: uuid.UUID, websocket: WebSocket) -> None:
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(f"User {user_id} connected via WebSocket. Total connections for user: {len(self.active_connections[user_id])}")

    def disconnect(self, user_id: uuid.UUID, websocket: WebSocket) -> bool:
        """Removes connection. Returns True if user has zero active connections remaining."""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                logger.info(f"User {user_id} has disconnected all active WebSocket sessions.")
                return True
        return False

    async def send_personal_message(self, user_id: uuid.UUID, payload: dict) -> None:
        """Sends payload to all active WebSocket connections for a given user."""
        if user_id in self.active_connections:
            dead_sockets = set()
            message_str = json.dumps(payload, default=str)
            for connection in list(self.active_connections[user_id]):
                try:
                    await connection.send_text(message_str)
                except Exception as e:
                    logger.warning(f"Error sending message to socket for user {user_id}: {e}")
                    dead_sockets.add(connection)
            
            for dead in dead_sockets:
                self.active_connections[user_id].discard(dead)

    async def broadcast_event(self, user_ids: list[uuid.UUID], payload: dict) -> None:
        """Broadcasts payload to multiple user IDs."""
        for uid in user_ids:
            await self.send_personal_message(uid, payload)


manager = ConnectionManager()
