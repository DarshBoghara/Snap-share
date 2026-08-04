import uuid
from datetime import datetime, timezone
from typing import Sequence
from sqlalchemy import or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_username_or_email(self, identifier: str) -> User | None:
        result = await self.db.execute(
            select(User).where(or_(User.username == identifier, User.email == identifier))
        )
        return result.scalar_one_or_none()

    async def create(self, username: str, email: str, password_hash: str) -> User:
        user = User(
            username=username,
            email=email,
            password_hash=password_hash
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def search_users(self, query: str, current_user_id: uuid.UUID, limit: int = 20) -> Sequence[User]:
        pattern = f"%{query}%"
        stmt = (
            select(User)
            .where(
                User.id != current_user_id,
                or_(User.username.ilike(pattern), User.email.ilike(pattern))
            )
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def update_online_status(self, user_id: uuid.UUID, is_online: bool) -> None:
        now = datetime.now(timezone.utc)
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(is_online=is_online, last_seen=now, updated_at=now)
        )
        await self.db.execute(stmt)
        await self.db.commit()

    async def update_profile(self, user_id: uuid.UUID, username: str | None = None, profile_image: str | None = None) -> User | None:
        user = await self.get_by_id(user_id)
        if not user:
            return None
        if username:
            user.username = username
        if profile_image is not None:
            user.profile_image = profile_image
        user.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(user)
        return user
