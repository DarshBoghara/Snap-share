import json
import logging
import uuid
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import AsyncSessionLocal
from app.dependencies.redis import get_redis
from app.schemas.ws_events import WSEvent
from app.services.presence_service import PresenceService
from app.utils.security import decode_token
from app.websocket.connection_manager import manager
from app.websocket.event_handlers import handle_ws_message
from app.websocket.redis_pubsub import pubsub_manager

router = APIRouter(tags=["WebSocket"])
logger = logging.getLogger("ws_endpoint")


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    # Validate token
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        user_id_str = payload.get("sub")
        if not user_id_str:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        user_id = uuid.UUID(user_id_str)
    except Exception as e:
        logger.warning(f"WebSocket auth failed: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Connection limit check
    MAX_CONNECTIONS_PER_USER = 10
    if len(manager.active_connections.get(user_id, set())) >= MAX_CONNECTIONS_PER_USER:
        logger.warning(f"User {user_id} exceeded max concurrent WebSocket connections limit.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Connection accepted
    socket_id = str(uuid.uuid4())
    await manager.connect(user_id, websocket)

    # Initialize redis and presence
    async for redis_client in get_redis():
        async with AsyncSessionLocal() as db:
            presence_service = PresenceService(redis_client, db)
            await presence_service.set_user_online(user_id, socket_id)

            # Broadcast user presence online event
            await pubsub_manager.publish_event(
                [user_id],
                {"event": "user_presence", "data": {"user_id": str(user_id), "is_online": True}}
            )

            try:
                while True:
                    data_text = await websocket.receive_text()
                    try:
                        raw_json = json.loads(data_text)
                        ws_event = WSEvent.model_validate(raw_json)
                        # Process message in session block
                        async with AsyncSessionLocal() as event_db:
                            await handle_ws_message(ws_event, user_id, event_db, redis_client)
                    except Exception as parse_err:
                        logger.error(f"Invalid WS message schema: {parse_err}")
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for user {user_id}")
            except Exception as e:
                logger.error(f"Unexpected error in WS loop for user {user_id}: {e}")
            finally:
                is_fully_offline = manager.disconnect(user_id, websocket)
                if is_fully_offline:
                    async with AsyncSessionLocal() as disconnect_db:
                        presence_dis = PresenceService(redis_client, disconnect_db)
                        await presence_dis.set_user_offline(user_id, socket_id)
        break
