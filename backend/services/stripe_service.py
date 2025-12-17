"""\nStripe payment service for AIPhDWriter\nHandles payment intents and purchase confirmations\n"""
import stripe
import logging
from typing import Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Add-on prices (in dollars)
# NOTE: Frontend sends extra illustrations count, 1 cover image is FREE
ADD_ON_PRICES = {
    "extra_illustration": 1,  # $1 per extra illustration (NEW)
    "illustrations": 20,       # Legacy
    "cover": 19,              # Legacy
    "rush": 29,
    "editing": 99,
    "publishing": 49
}

class StripeService:
    """Handle Stripe payments"""

    async def create_payment_intent(
        self,
        book_id: str,
        base_price: int,
        add_ons: list[str]
    ) -> Dict[str, Any]:
        """
        Create a Stripe PaymentIntent for the book purchase
        """
        try:
            # Calculate total
            add_ons_total = sum(ADD_ON_PRICES.get(addon, 0) for addon in add_ons)
            total_price = base_price + add_ons_total

            logger.info(f"Creating payment intent: ${total_price} (base: ${base_price}, add-ons: ${add_ons_total})")

            # Create PaymentIntent
            payment_intent = stripe.PaymentIntent.create(
                amount=total_price * 100,  # Convert to cents
                currency="usd",
                metadata={
                    "book_id": book_id,
                    "add_ons": ",".join(add_ons)
                },
                description=f"AI-Generated Book - {book_id}"
            )

            # Build breakdown
            breakdown = {
                "base": base_price * 100,
                "total": total_price * 100
            }

            # Add individual add-on prices
            for addon in add_ons:
                if addon in ADD_ON_PRICES:
                    breakdown[addon] = ADD_ON_PRICES[addon] * 100

            logger.info(f"✅ Payment intent created: {payment_intent.id}")

            return {
                "client_secret": payment_intent.client_secret,
                "total_amount": total_price * 100,
                "breakdown": breakdown
            }

        except stripe.error.StripeError as e:
            logger.error(f"❌ Stripe error: {e}")
            raise Exception(f"Payment intent creation failed: {str(e)}")

    async def verify_payment(self, payment_intent_id: str) -> bool:
        """
        Verify that a payment was successful
        """
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            if payment_intent.status == "succeeded":
                logger.info(f"✅ Payment verified: {payment_intent_id}")
                return True
            else:
                logger.warning(f"⚠️ Payment not succeeded: {payment_intent.status}")
                return False

        except stripe.error.StripeError as e:
            logger.error(f"❌ Payment verification failed: {e}")
            return False

    def get_payment_status(self, payment_intent_id: str) -> str:
        """Get payment intent status"""
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return payment_intent.status
        except stripe.error.StripeError as e:
            logger.error(f"❌ Failed to get payment status: {e}")
            return "unknown"

# Singleton
stripe_service = StripeService()
