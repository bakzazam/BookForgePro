"""Book status endpoint"""
from fastapi import APIRouter, HTTPException
import logging

from app.models import BookStatus
from app.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/status/{book_id}", response_model=BookStatus)
async def get_book_status(book_id: str):
    """
    Get book generation status
    Frontend polls this every 5 seconds
    """
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            book = await conn.fetchrow("""
                SELECT book_id, status, progress, current_step,
                       download_url, completed_at
                FROM books
                WHERE book_id = $1
            """, book_id)

            if not book:
                raise HTTPException(status_code=404, detail="Book not found")

            return BookStatus(
                book_id=str(book["book_id"]),
                status=book["status"],
                progress=book["progress"] or 0,
                current_step=book["current_step"] or "Processing...",
                completed_at=book["completed_at"].isoformat() if book["completed_at"] else None,
                download_url=book["download_url"]
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Status check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
