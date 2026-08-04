import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.message import MessageStatus


class MessageCreate(BaseModel):
    receiver_id: uuid.UUID
    message: str = Field(..., min_length=1, max_length=4096)


class MessageResponse(BaseModel):
    id: uuid.UUID
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    message: str
    status: str
    created_at: datetime
    seen_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class MessageStatusUpdate(BaseModel):
    message_id: uuid.UUID
    status: MessageStatus


class MessageReadRequest(BaseModel):
    message_ids: list[uuid.UUID]
