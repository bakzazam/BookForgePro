"""Payment intent endpoint"""
from fastapi import APIRouter, HTTPException
import logging

from app.models import PaymentIntentRequest, PaymentIntentResponse
from app.database import get_db
from services.stripe_service import stripe_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(request: PaymentIntentRequest):
    """
    Create Stripe payment intent for book purchase
    """
    try:
        logger.info(f"Payment intent request for book: {request.book_id}")

        # Get book from database to get base price
        pool = await get_db()
        async with pool.acquire() as conn:
            book = await conn.fetchrow("""
                SELECT price FROM books WHERE book_id = $1
            """, request.book_id)

            if not book:
                raise HTTPException(status_code=404, detail="Book not found")

            base_price = int(book["price"])

        # Create Stripe payment intent
        payment_data = await stripe_service.create_payment_intent(
            book_id=request.book_id,
            base_price=base_price,
            add_ons=request.add_ons
        )

        return PaymentIntentResponse(
            client_secret=payment_data["client_secret"],
            total_amount=payment_data["total_amount"],
            breakdown=payment_data["breakdown"]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Payment intent creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
