from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from app.api.router import api_router
from app.config.settings import settings
from app.database.base import Base
from app.database.session import engine
from app.middleware.cors import setup_cors
from app.websocket.redis_pubsub import pubsub_manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and start Redis PubSub
    logger.info("Initializing database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Starting Redis PubSub Manager...")
    await pubsub_manager.start()
    
    yield
    
    # Shutdown: stop Redis PubSub and dispose engine
    logger.info("Shutting down Redis PubSub Manager...")
    await pubsub_manager.stop()
    logger.info("Closing Database engine...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Setup CORS
setup_cors(app)

# Include Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}
