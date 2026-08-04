import logging
import uuid
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.message import MessageStatus
from app.schemas.message import MessageCreate
from app.schemas.ws_events import WSEvent, WSEventType
from app.services.message_service import MessageService
from app.services.presence_service import PresenceService
from app.websocket.redis_pubsub import pubsub_manager

logger = logging.getLogger("ws_handlers")


async def handle_ws_message(
    event: WSEvent,
    sender_id: uuid.UUID,
    db: AsyncSession,
    redis_client: redis.Redis
) -> None:
    message_service = MessageService(db)
    presence_service = PresenceService(redis_client, db)

    if event.event == WSEventType.HEARTBEAT:
        await presence_service.refresh_heartbeat(sender_id)
        await pubsub_manager.publish_event(
            [sender_id],
            {"event": WSEventType.PONG, "data": {"timestamp": event.data.get("timestamp")}}
        )

    elif event.event == WSEventType.SEND_MESSAGE:
        try:
            receiver_id = uuid.UUID(event.data["receiver_id"])
            content = event.data["message"]
            req = MessageCreate(receiver_id=receiver_id, message=content)
            
            saved_msg = await message_service.send_message(sender_id, req)
            msg_dict = saved_msg.model_dump(mode="json")

            # Publish event to receiver and sender ACK
            payload = {
                "event": WSEventType.NEW_MESSAGE.value,
                "data": msg_dict
            }
            await pubsub_manager.publish_event([receiver_id, sender_id], payload)
        except Exception as e:
            logger.error(f"Error sending message via WS: {e}")
            await pubsub_manager.publish_event(
                [sender_id],
                {"event": WSEventType.ERROR.value, "data": {"detail": str(e)}}
            )

    elif event.event == WSEventType.READ_MESSAGE:
        """
        Disappearing Message Event Trigger:
        Triggered when user exits chat window or switches conversation ->
        Mark seen and immediately delete messages from DB & notify both clients.
        Supports single message_id or list of message_ids.
        """
        try:
            target_ids = []
            if "message_ids" in event.data and isinstance(event.data["message_ids"], list):
                target_ids = [uuid.UUID(mid) for mid in event.data["message_ids"]]
            elif "message_id" in event.data:
                target_ids = [uuid.UUID(event.data["message_id"])]

            for msg_id in target_ids:
                deleted_msg = await message_service.mark_seen_and_delete(msg_id)
                if deleted_msg:
                    payload = {
                        "event": WSEventType.MESSAGE_DELETED.value,
                        "data": {
                            "message_id": str(msg_id),
                            "sender_id": str(deleted_msg.sender_id),
                            "receiver_id": str(deleted_msg.receiver_id),
                            "status": MessageStatus.SEEN.value
                        }
                    }
                    # Broadcast immediate disappearance event to both users
                    await pubsub_manager.publish_event(
                        [deleted_msg.sender_id, deleted_msg.receiver_id],
                        payload
                    )
        except Exception as e:
            logger.error(f"Error handling read_message / disappearing event: {e}")

    elif event.event in (WSEventType.TYPING, WSEventType.STOP_TYPING):
        try:
            receiver_id = uuid.UUID(event.data["receiver_id"])
            payload = {
                "event": WSEventType.TYPING_INDICATOR.value,
                "data": {
                    "sender_id": str(sender_id),
                    "is_typing": (event.event == WSEventType.TYPING)
                }
            }
            await pubsub_manager.publish_event([receiver_id], payload)
        except Exception as e:
            logger.error(f"Error forwarding typing indicator: {e}")
