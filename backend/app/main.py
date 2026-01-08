from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import pdf, encoder, json_editor
from app.utils.file_helpers import ensure_directories, schedule_cleanup_task
from app.config import settings
import asyncio

# Create necessary directories
ensure_directories()

app = FastAPI(
    title="Toolkit API",
    description="API for PDF processing and encoding/decoding operations",
    version="1.0.0"
)

# Start background cleanup task
@app.on_event("startup")
async def startup_event():
    """Start background tasks on application startup"""
    asyncio.create_task(schedule_cleanup_task())
    print("✅ Background file cleanup task started (runs every 30 minutes)")

# CORS middleware
# Get allowed origins from environment variable, fallback to localhost for development
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# Add production frontend URL if configured
if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pdf.router)
app.include_router(encoder.router)
app.include_router(json_editor.router)

@app.get("/")
async def root():
    return {
        "message": "Toolkit API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
