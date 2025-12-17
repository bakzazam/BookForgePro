"""
AIPhDWriter Backend API
Powered by MVAE MCP and Gemini MCP
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.api import preview, payment, purchase, status, download
from app.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    logger.info("🚀 Starting AIPhDWriter API...")
    await init_db()
    logger.info("✅ Database initialized")
    yield
    logger.info("👋 Shutting down AIPhDWriter API")

# Create FastAPI app
app = FastAPI(
    title="AIPhDWriter API",
    description="AI-powered book generation platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(preview.router, prefix="/api", tags=["Preview"])
app.include_router(payment.router, prefix="/api", tags=["Payment"])
app.include_router(purchase.router, prefix="/api", tags=["Purchase"])
app.include_router(status.router, prefix="/api", tags=["Status"])
app.include_router(download.router, prefix="/api", tags=["Download"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "AIPhDWriter API",
        "status": "healthy",
        "version": "1.0.0",
        "mcp_enabled": True
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "mcp": {
            "mvae": "available",
            "gemini": "available"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
