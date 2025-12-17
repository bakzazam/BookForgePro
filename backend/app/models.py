"""Pydantic models for API requests and responses"""
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Literal
from datetime import datetime

# Request Models
class BookRequest(BaseModel):
    topic: str
    audience: str  # Accept any audience type (48+ options from frontend)
    length: Literal["short", "standard", "comprehensive", "dissertation"]
    style: str  # Accept any writing style (58+ options from frontend)
    user_email: EmailStr
    additional_instructions: Optional[str] = None

class PaymentIntentRequest(BaseModel):
    book_id: str
    add_ons: List[str] = []

class PurchaseRequest(BaseModel):
    book_id: str
    payment_intent_id: str
    email: EmailStr
    add_ons: List[str] = []
    platform: Literal["ios", "android", "web"] = "web"
    device_token: Optional[str] = None

# Response Models
class Chapter(BaseModel):
    number: int
    title: str
    focus: str
    key_points: List[str]

class BookOutline(BaseModel):
    title: str
    subtitle: str
    chapters: List[Chapter]

class BookPreview(BaseModel):
    book_id: str
    outline: BookOutline
    chapter_1: str
    estimated_pages: int
    price: int
    estimated_time: str

class PaymentIntentResponse(BaseModel):
    client_secret: str
    total_amount: int
    breakdown: dict

class PurchaseResponse(BaseModel):
    success: bool
    book_id: str
    status_url: str
    message: str

class BookStatus(BaseModel):
    book_id: str
    status: Literal["preview", "generating", "complete", "failed"]
    progress: int
    current_step: str
    estimated_completion: Optional[str] = None
    completed_at: Optional[str] = None
    download_url: Optional[str] = None
