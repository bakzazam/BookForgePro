"""Preview generation endpoint"""
from fastapi import APIRouter, HTTPException
import uuid
import json
import logging
from datetime import datetime

from app.models import BookRequest, BookPreview
from app.database import get_db
from services.book_generator import book_generator

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/preview", response_model=BookPreview)
async def generate_preview(request: BookRequest):
    """
    Generate FREE preview (outline + Chapter 1)
    This is the entry point - users see this before paying
    """
    try:
        logger.info(f"Preview request: {request.topic} for {request.audience}")

        # Generate book_id
        book_id = str(uuid.uuid4())

        # Generate preview using MCP
        preview_data = await book_generator.generate_preview(
            topic=request.topic,
            audience=request.audience,
            length=request.length,
            style=request.style,
            additional_instructions=request.additional_instructions or ""
        )

        # Store in database
        pool = await get_db()
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO books (
                    book_id, user_email, topic, audience, length, style,
                    additional_instructions, status, outline, chapter_1,
                    estimated_pages, price, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            """,
                book_id,
                request.user_email,
                request.topic,
                request.audience,
                request.length,
                request.style,
                request.additional_instructions,
                "preview",
                json.dumps(preview_data["outline"]),
                preview_data["chapter_1"],
                preview_data["estimated_pages"],
                preview_data["price"],
                datetime.utcnow()
            )

        logger.info(f"✅ Preview generated: {book_id}")

        return BookPreview(
            book_id=book_id,
            outline=preview_data["outline"],
            chapter_1=preview_data["chapter_1"],
            estimated_pages=preview_data["estimated_pages"],
            price=preview_data["price"],
            estimated_time=preview_data["estimated_time"]
        )

    except Exception as e:
        logger.error(f"❌ Preview generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
