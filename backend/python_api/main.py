import logging
from contextlib import asynccontextmanager

from beanie import init_beanie
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from core.config import settings
from models.user import User
from routes import auth

logger = logging.getLogger(__name__)


# ── Application lifespan (replaces deprecated @app.on_event) ─────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[User],
    )
    # Log connected state but NOT the URI (which may contain credentials)
    logger.info("MongoDB connection established")
    yield

    # ── Shutdown ─────────────────────────────────────────────────────
    client.close()
    logger.info("MongoDB connection closed")


# ── App factory ───────────────────────────────────────────────────────

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="High-performance backend for HealthSync AI.",
    version="1.0.0",
    lifespan=lifespan,
    # Hide /docs and /redoc in production by setting docs_url=None
)

# ── CORS ──────────────────────────────────────────────────────────────
# FIX: allow_origins is now loaded from settings (env var), NOT hardcoded "*".
# allow_credentials=True is only safe when origins are explicitly listed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,   # e.g. ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# ── Routes ────────────────────────────────────────────────────────────

@app.get("/health", tags=["ops"])
async def health_check():
    """Liveness probe — returns 200 when the app is running."""
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "HealthSync Backend Running"}


app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
