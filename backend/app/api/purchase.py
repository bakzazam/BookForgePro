"""Purchase confirmation endpoint"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
import logging
from datetime import datetime
import asyncio

from app.models import PurchaseRequest, PurchaseResponse
from app.database import get_db
from services.stripe_service import stripe_service
from services.full_book_generator import generate_full_book

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/purchase", response_model=PurchaseResponse)
async def confirm_purchase(request: PurchaseRequest, background_tasks: BackgroundTasks):
    """
    Confirm payment and start full book generation
    """
    try:
        logger.info(f"Purchase request for book: {request.book_id}")

        # Verify payment with Stripe
        payment_verified = await stripe_service.verify_payment(request.payment_intent_id)

        if not payment_verified:
            raise HTTPException(
                status_code=400,
                detail="Payment not verified. Please complete payment first."
            )

        # Update database
        pool = await get_db()
        async with pool.acquire() as conn:
            await conn.execute("""
                UPDATE books
                SET paid = TRUE,
                    paid_at = $1,
                    status = 'generating',
                    progress = 0,
                    current_step = 'Starting book generation...',
                    payment_intent_id = $2,
                    add_ons = $3
                WHERE book_id = $4
            """,
                datetime.utcnow(),
                request.payment_intent_id,
                request.add_ons,
                request.book_id
            )

        # Trigger background job to generate full book
        background_tasks.add_task(generate_full_book, request.book_id)
        logger.info(f"✅ Purchase confirmed, book generation started: {request.book_id}")

        return PurchaseResponse(
            success=True,
            book_id=request.book_id,
            status_url=f"https://api.k9appbuilder.com/api/status/{request.book_id}",
            message="Your book is being generated!"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Purchase confirmation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
