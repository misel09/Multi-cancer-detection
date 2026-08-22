"""
FastAPI application entry point.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config.settings import settings
from app.db.database import init_db
from app.routes import auth, dashboard, model, predictions


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting up — initialising database...")
    init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "originals"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "gradcam"), exist_ok=True)
    print("✅ Database ready.")
    yield
    # Shutdown
    print("👋 Shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI-assisted multi-cancer detection prototype API",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(predictions.router)
app.include_router(dashboard.router)
app.include_router(model.router)

# ── Static file serving for uploads ──────────────────────────────────────────
if os.path.exists(settings.UPLOAD_DIR):
    app.mount(
        f"/{settings.UPLOAD_DIR}",
        StaticFiles(directory=settings.UPLOAD_DIR),
        name="uploads",
    )


@app.get("/")
def root():
    return {"message": f"{settings.APP_NAME} is running 🎯"}


@app.get("/health")
def health():
    return {"status": "ok"}
