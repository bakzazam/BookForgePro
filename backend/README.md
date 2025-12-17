# BookForgePro Backend API

AI-powered book generation platform backend built with FastAPI and OpenAI GPT-4o.

## Features

- **FREE Preview Generation**: Generate book outline + Chapter 1 before payment
- **AI-Powered Content**: Uses OpenAI GPT-4o for high-quality book generation
- **Parallel Chapter Generation**: Generates all chapters simultaneously for faster completion
- **Stripe Integration**: Secure payment processing with add-ons support
- **Multi-Format Export**: Download books as PDF, DOCX, or EPUB
- **Real-time Progress**: WebSocket-style polling for generation status
- **PostgreSQL Database**: Reliable data storage with asyncpg

## Tech Stack

- **FastAPI**: Modern async web framework
- **OpenAI GPT-4o**: AI content generation
- **PostgreSQL**: Database with asyncpg
- **Stripe**: Payment processing
- **Pandoc**: Document conversion (PDF/DOCX/EPUB)
- **Docker**: Containerized deployment

## Architecture

```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   ├── preview.py    # Preview generation (free)
│   │   ├── payment.py    # Payment intent creation
│   │   ├── purchase.py   # Purchase confirmation
│   │   ├── status.py     # Status polling
│   │   └── download.py   # Book download with format conversion
│   ├── config.py         # Configuration management
│   ├── database.py       # Database connection and initialization
│   └── models.py         # Pydantic models
├── services/
│   ├── ai_generator.py           # OpenAI GPT-4o integration
│   ├── book_generator.py         # Preview generation orchestration
│   ├── full_book_generator.py    # Full book generation with parallel chapters
│   ├── stripe_service.py         # Stripe payment integration
│   └── mcp_client.py             # MCP client (optional)
├── main.py               # FastAPI app entry point
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
└── requirements.txt      # Python dependencies
```

## API Endpoints

### 1. Preview Generation (FREE)
```http
POST /api/preview
Content-Type: application/json

{
  "topic": "Machine Learning for Beginners",
  "audience": "college_students",
  "length": "standard",
  "style": "academic",
  "user_email": "user@example.com",
  "additional_instructions": "Focus on Python examples"
}
```

**Response**: Book outline + Chapter 1 + pricing

### 2. Create Payment Intent
```http
POST /api/create-payment-intent
Content-Type: application/json

{
  "book_id": "uuid",
  "add_ons": ["rush", "editing"]
}
```

**Response**: Stripe client_secret for payment

### 3. Confirm Purchase
```http
POST /api/purchase
Content-Type: application/json

{
  "book_id": "uuid",
  "payment_intent_id": "pi_xxx",
  "email": "user@example.com",
  "add_ons": ["rush"]
}
```

**Response**: Success + status URL

### 4. Check Status
```http
GET /api/status/{book_id}
```

**Response**: Progress percentage + current step

### 5. Download Book
```http
GET /api/download/{book_id}?format=pdf
```

**Formats**: pdf, docx, epub

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/bookforgepro

# API Keys
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx  # Optional
GOOGLE_API_KEY=xxx            # Optional

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# MCP URLs (Optional)
MVAE_MCP_URL=http://localhost:8765
GEMINI_MCP_URL=http://localhost:8766

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET=bookforgepro-books

# App
ENVIRONMENT=production
API_BASE_URL=https://api.yourdomain.com
```

## Installation

### Local Development

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Install Pandoc** (for document conversion):
```bash
# Ubuntu/Debian
sudo apt-get install pandoc texlive-xetex texlive-fonts-recommended

# macOS
brew install pandoc
brew install --cask basictex
```

3. **Setup PostgreSQL**:
```bash
# Create database
createdb bookforgepro
```

4. **Run the server**:
```bash
uvicorn main:app --reload --port 8001
```

API will be available at `http://localhost:8001`

### Docker Deployment

1. **Build and run**:
```bash
docker-compose up -d
```

2. **View logs**:
```bash
docker-compose logs -f
```

3. **Stop**:
```bash
docker-compose down
```

## Pricing Model

### Base Prices
- **Short** (5-7 chapters): $9
- **Standard** (8-12 chapters): $19
- **Comprehensive** (15-20 chapters): $79
- **Dissertation** (20+ chapters): $199

### Add-ons
- **Extra Illustrations**: $1 each (1 cover image FREE)
- **Rush Processing**: $29
- **Professional Editing**: $99
- **Publishing Assistance**: $49

## Generation Flow

1. **Preview Phase** (FREE):
   - User submits topic + preferences
   - AI generates outline (using GPT-4o)
   - AI generates Chapter 1 (using GPT-4o)
   - User reviews before payment

2. **Payment Phase**:
   - User reviews preview
   - Creates Stripe payment intent
   - Completes payment

3. **Generation Phase**:
   - Background job starts
   - All remaining chapters generated in parallel
   - Progress updates in real-time
   - Book assembled into single markdown file

4. **Download Phase**:
   - User downloads book
   - Pandoc converts to PDF/DOCX/EPUB on-demand

## Database Schema

```sql
CREATE TABLE books (
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
```

## Performance

- **Preview Generation**: 30-60 seconds
- **Full Book Generation**: 4-24 hours (depending on length)
- **Parallel Chapter Generation**: ~20-30 chapters can be generated simultaneously
- **Format Conversion**: 5-10 seconds per format

## Monitoring

Check application logs:
```bash
# Docker
docker-compose logs -f aiphdwriter-api

# Local
tail -f logs/api.log
```

Health check endpoint:
```bash
curl http://localhost:8001/health
```

## Development

### Running Tests
```bash
pytest tests/
```

### Code Style
```bash
black .
flake8 .
```

## Deployment

### Production Checklist

- [ ] Set `ENVIRONMENT=production` in `.env`
- [ ] Configure CORS allowed origins in `main.py`
- [ ] Setup SSL certificates (nginx)
- [ ] Configure database backups
- [ ] Setup monitoring and logging
- [ ] Configure Stripe webhooks
- [ ] Setup CDN for static files
- [ ] Configure rate limiting

### Nginx Configuration

See `nginx-config-snippet.conf` for nginx reverse proxy setup.

## Troubleshooting

### Issue: "Database connection failed"
- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running
- Check database permissions

### Issue: "OpenAI API error"
- Verify `OPENAI_API_KEY` is correct
- Check API usage limits
- Ensure sufficient credits

### Issue: "Pandoc conversion failed"
- Install pandoc and texlive
- Check file permissions in `/app/storage`

## Support

For issues and questions:
- GitHub Issues: https://github.com/bakzazam/BookForgePro/issues
- Email: support@bookforgepro.com

## License

Proprietary - All rights reserved
