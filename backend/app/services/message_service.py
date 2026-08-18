import uuid
from typing import Sequence
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.message import Message, MessageStatus
from app.repositories.message_repo import MessageRepository
from app.repositories.user_repo import UserRepository
from app.schemas.message import MessageCreate, MessageResponse


class MessageService:
    def __init__(self, db: AsyncSession):
        self.message_repo = MessageRepository(db)
        self.user_repo = UserRepository(db)

    async def send_message(self, sender_id: uuid.UUID, req: MessageCreate) -> MessageResponse:
        receiver = await self.user_repo.get_by_id(req.receiver_id)
        if not receiver:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receiver user not found")

        # Determine initial delivery status if receiver is online
        initial_status = MessageStatus.DELIVERED.value if receiver.is_online else MessageStatus.SENT.value

        msg = await self.message_repo.create_message(
            sender_id=sender_id,
            receiver_id=req.receiver_id,
            content=req.message,
            status=initial_status
        )
        return MessageResponse.model_validate(msg)

    async def mark_seen_and_delete(self, message_id: uuid.UUID, receiver_id: uuid.UUID) -> MessageResponse | None:
        """
        Disappearing message core action:
        Verifies receiver authorization and instantly deletes message from DB.
        """
        msg = await self.message_repo.mark_seen_and_delete_immediately(message_id, receiver_id)
        if not msg:
            return None
        return MessageResponse.model_validate(msg)

    async def get_active_messages(
        self, user_a_id: uuid.UUID, user_b_id: uuid.UUID, limit: int = 50, offset: int = 0
    ) -> Sequence[MessageResponse]:
        messages = await self.message_repo.get_active_conversation_messages(user_a_id, user_b_id, limit=limit, offset=offset)
        return [MessageResponse.model_validate(m) for m in messages]

    async def get_unread_counts(self, user_id: uuid.UUID) -> dict[str, int]:
        counts = await self.message_repo.get_unread_count_by_sender(user_id)
        return {str(k): v for k, v in counts.items()}
