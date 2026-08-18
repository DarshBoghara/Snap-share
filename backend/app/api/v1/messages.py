import uuid
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.auth import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse
from app.services.message_service import MessageService

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    req: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MessageService(db)
    return await service.send_message(current_user.id, req)


@router.get("/conversation/{other_user_id}", response_model=List[MessageResponse])
async def get_conversation(
    other_user_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MessageService(db)
    return await service.get_active_messages(current_user.id, other_user_id, limit=limit, offset=offset)


@router.get("/unread-counts", response_model=Dict[str, int])
async def get_unread_counts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = MessageService(db)
    return await service.get_unread_counts(current_user.id)


@router.delete("/read/{message_id}", response_model=MessageResponse)
async def mark_read_and_disappear(
    message_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    HTTP Fallback / Direct endpoint to trigger message read & instant deletion.
    """
    service = MessageService(db)
    res = await service.mark_seen_and_delete(message_id, current_user.id)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found or unauthorized")
    return res
