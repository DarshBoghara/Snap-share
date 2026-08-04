import logging
import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.config.settings import settings

logger = logging.getLogger("db_session")

# Determine DB Engine
# If explicitly running in Docker or DATABASE_URL provided, use Postgres, else default to local SQLite for smooth dev execution
db_url = settings.DATABASE_URL
if not db_url:
    # Use SQLite for standalone local execution, or PostgreSQL if configured
    db_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./snapchat_chat.db")

logger.info(f"Connecting database engine using URL: {db_url}")

if "sqlite" in db_url:
    engine = create_async_engine(db_url, echo=False, future=True)
else:
    engine = create_async_engine(
        db_url,
        echo=False,
        future=True,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides an async database session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
