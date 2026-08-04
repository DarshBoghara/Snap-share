import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr


class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    profile_image: str | None = None
    is_online: bool
    last_seen: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    username: str | None = None
    profile_image: str | None = None


class UserSearchResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    profile_image: str | None = None
    is_online: bool
    last_seen: datetime

    model_config = ConfigDict(from_attributes=True)
