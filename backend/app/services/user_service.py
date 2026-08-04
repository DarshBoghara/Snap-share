import uuid
from typing import Sequence
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserResponse, UserSearchResponse, UserUpdate


class UserService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)

    async def get_by_id(self, user_id: uuid.UUID) -> UserResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return UserResponse.model_validate(user)

    async def search_users(self, query: str, current_user_id: uuid.UUID) -> Sequence[UserSearchResponse]:
        if not query or len(query.strip()) == 0:
            return []
        users = await self.user_repo.search_users(query.strip(), current_user_id)
        return [UserSearchResponse.model_validate(u) for u in users]

    async def update_profile(self, user_id: uuid.UUID, req: UserUpdate) -> UserResponse:
        if req.username:
            existing = await self.user_repo.get_by_username(req.username)
            if existing and existing.id != user_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
        
        updated_user = await self.user_repo.update_profile(user_id, req.username, req.profile_image)
        if not updated_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return UserResponse.model_validate(updated_user)
