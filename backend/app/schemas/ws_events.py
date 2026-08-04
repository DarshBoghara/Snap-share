import enum
from typing import Any, Dict, Optional
from pydantic import BaseModel


class WSEventType(str, enum.Enum):
    # Client -> Server
    SEND_MESSAGE = "send_message"
    READ_MESSAGE = "read_message"
    TYPING = "typing"
    STOP_TYPING = "stop_typing"
    HEARTBEAT = "heartbeat"

    # Server -> Client
    NEW_MESSAGE = "new_message"
    MESSAGE_STATUS_UPDATE = "message_status_update"
    MESSAGE_DELETED = "message_deleted"
    USER_PRESENCE = "user_presence"
    TYPING_INDICATOR = "typing_indicator"
    ERROR = "error"
    PONG = "pong"


class WSEvent(BaseModel):
    event: WSEventType
    data: Dict[str, Any]
    correlation_id: Optional[str] = None
