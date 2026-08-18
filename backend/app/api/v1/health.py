import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as redis

from app.database.session import get_db
from app.dependencies.redis import get_redis

router = APIRouter(prefix="/health", tags=["Health"])
logger = logging.getLogger("health_check")


@router.get("", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "ok", "service": "SnapShare"}


@router.get("/ready", status_code=status.HTTP_200_OK)
async def readiness_check(
    db: AsyncSession = Depends(get_db),
    redis_client=Depends(get_redis)
):
    health_status = {
        "status": "ok",
        "database": "unknown",
        "redis": "unknown"
    }

    # Check database
    try:
        await db.execute(text("SELECT 1"))
        health_status["database"] = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status["database"] = "unhealthy"
        health_status["status"] = "degraded"

    # Check Redis
    try:
        if hasattr(redis_client, "ping"):
            await redis_client.ping()
            health_status["redis"] = "healthy"
        else:
            health_status["redis"] = "mock_fallback"
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        health_status["redis"] = "unhealthy"

    if health_status["status"] == "degraded" and health_status["database"] == "unhealthy":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=health_status
        )

    return health_status
