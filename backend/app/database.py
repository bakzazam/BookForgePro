"""Database models and initialization"""
import asyncpg
import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

# Database connection pool
pool: Optional[asyncpg.Pool] = None

async def init_db():
    """Initialize database connection and create tables"""
    global pool

    try:
        # Create connection pool
        pool = await asyncpg.create_pool(
            settings.DATABASE_URL,
            min_size=2,
            max_size=10
        )
        logger.info("✅ Database connection pool created")

        # Create aiphdwriter database if it doesn't exist
        # First connect to default postgres database
        conn = await asyncpg.connect(settings.DATABASE_URL.replace('/aiphdwriter', '/postgres'))

        # Check if database exists
        db_exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = 'aiphdwriter'"
        )

        if not db_exists:
            await conn.execute("CREATE DATABASE aiphdwriter")
            logger.info("✅ Created aiphdwriter database")

        await conn.close()

        # Now connect to aiphdwriter database and create tables
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS books (
                    book_id UUID PRIMARY KEY,
                    user_email VARCHAR(255) NOT NULL,

                    -- Request details
                    topic TEXT NOT NULL,
                    audience VARCHAR(50),
                    length VARCHAR(50),
                    style VARCHAR(50),
                    additional_instructions TEXT,

                    -- Status
                    status VARCHAR(20) DEFAULT 'preview',
                    paid BOOLEAN DEFAULT FALSE,
                    progress INTEGER DEFAULT 0,
                    current_step TEXT,

                    -- Pricing
                    price DECIMAL(10,2),
                    total_paid DECIMAL(10,2),
                    add_ons TEXT[],

                    -- Content
                    outline JSONB,
                    chapter_1 TEXT,
                    estimated_pages INTEGER,

                    -- Files
                    download_url TEXT,

                    -- Payment
                    payment_intent_id VARCHAR(255),
                    stripe_customer_id VARCHAR(255),

                    -- Timestamps
                    created_at TIMESTAMP DEFAULT NOW(),
                    paid_at TIMESTAMP,
                    completed_at TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_books_email ON books(user_email);
                CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
                CREATE INDEX IF NOT EXISTS idx_books_created ON books(created_at DESC);
            """)
            logger.info("✅ Database tables created/verified")

    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise

async def get_db() -> asyncpg.Pool:
    """Get database connection pool"""
    if pool is None:
        await init_db()
    return pool
