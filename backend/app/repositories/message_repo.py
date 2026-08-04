import uuid
from datetime import datetime, timezone
from typing import Sequence
from sqlalchemy import delete, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.message import Message, MessageStatus


class MessageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, message_id: uuid.UUID) -> Message | None:
        result = await self.db.execute(select(Message).where(Message.id == message_id))
        return result.scalar_one_or_none()

    async def create_message(
        self, sender_id: uuid.UUID, receiver_id: uuid.UUID, content: str, status: str = MessageStatus.SENT.value
    ) -> Message:
        message = Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            message=content,
            status=status
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def mark_delivered(self, message_id: uuid.UUID) -> Message | None:
        stmt = (
            update(Message)
            .where(Message.id == message_id, Message.status == MessageStatus.SENT.value)
            .values(status=MessageStatus.DELIVERED.value)
            .returning(Message)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.scalar_one_or_none()

    async def mark_seen_and_delete_immediately(self, message_id: uuid.UUID) -> Message | None:
        """
        Core Snapchat Disappearing Engine logic:
        1. Query target message.
        2. If exists, immediately execute DELETE statement from DB.
        3. Return message metadata so WebSocket server can broadcast the deletion event to both users.
        """
        msg = await self.get_by_id(message_id)
        if not msg:
            return None
        
        # Immediate permanent purge from Database
        stmt = delete(Message).where(Message.id == message_id)
        await self.db.execute(stmt)
        await self.db.commit()
        return msg

    async def get_active_conversation_messages(
        self, user_a_id: uuid.UUID, user_b_id: uuid.UUID
    ) -> Sequence[Message]:
        """
        Retrieves active pending (unseen) messages between two users.
        Once seen, messages disappear from DB, so this only returns active messages.
        """
        stmt = (
            select(Message)
            .where(
                or_(
                    (Message.sender_id == user_a_id) & (Message.receiver_id == user_b_id),
                    (Message.sender_id == user_b_id) & (Message.receiver_id == user_a_id)
                )
            )
            .order_by(Message.created_at.asc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_unread_count_by_sender(self, receiver_id: uuid.UUID) -> dict[uuid.UUID, int]:
        """Returns dict of sender_id -> unread count for receiver."""
        stmt = select(Message.sender_id, Message.id).where(
            Message.receiver_id == receiver_id,
            Message.status != MessageStatus.SEEN.value
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        counts: dict[uuid.UUID, int] = {}
        for sender_id, _ in rows:
            counts[sender_id] = counts.get(sender_id, 0) + 1
        return counts
