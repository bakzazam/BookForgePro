"""\nBook generation service - orchestrates AI generation workflow\n"""
import asyncio
import json
import logging
from typing import Dict, List, Any
from datetime import datetime
import os

from services.ai_generator import ai_generator

logger = logging.getLogger(__name__)

class BookGeneratorService:
    """Service for generating books using AI"""

    def __init__(self):
        self.working_dir = "/home/ubuntu/aiphdwriter-backend/storage"
        os.makedirs(self.working_dir, exist_ok=True)

    async def generate_preview(
        self,
        topic: str,
        audience: str,
        length: str,
        style: str,
        additional_instructions: str = ""
    ) -> Dict[str, Any]:
        """
        Generate book preview (outline + Chapter 1)
        Uses real AI generation via Anthropic API
        """
        logger.info(f"Generating preview for: {topic}")

        # Step 1: Generate outline using AI
        outline = await ai_generator.generate_outline(
            topic=topic,
            audience=audience,
            length=length,
            style=style,
            additional_instructions=additional_instructions
        )

        # Step 2: Generate Chapter 1 using AI
        first_chapter = outline["chapters"][0]
        chapter_1_content = await ai_generator.generate_chapter(
            chapter_num=1,
            chapter_info=first_chapter,
            book_title=outline["title"],
            audience=audience,
            style=style
        )

        # Calculate price based on length
        price = self._calculate_price(length)
        estimated_pages = self._estimate_pages(length)

        # Enrich outline with calculated fields
        outline["totalChapters"] = len(outline["chapters"])
        outline["estimatedPages"] = estimated_pages
        outline["estimatedWords"] = estimated_pages * 250  # ~250 words per page

        return {
            "outline": outline,
            "chapter_1": chapter_1_content,
            "estimated_pages": estimated_pages,
            "price": price,
            "estimated_time": "4-24 hours"
        }

    def _get_chapter_count(self, length: str) -> int:
        """Get chapter count based on book length"""
        length_map = {
            "short": 6,        # 5-7 chapters
            "standard": 10,    # 8-12 chapters
            "comprehensive": 17, # 15-20 chapters
            "dissertation": 22   # 20+ chapters
        }
        return length_map.get(length, 10)

    def _calculate_price(self, length: str) -> int:
        """Calculate price based on length (NEW PRICING)"""
        price_map = {
            "short": 9,          # $9 (was $29)
            "standard": 19,      # $19 (was $49)
            "comprehensive": 79, # $79 (was $99)
            "dissertation": 199  # $199 (unchanged)
        }
        return price_map.get(length, 19)

    def _estimate_pages(self, length: str) -> int:
        """Estimate page count"""
        page_map = {
            "short": 50,         # ~5-7 chapters
            "standard": 100,     # ~8-12 chapters
            "comprehensive": 200, # ~15-20 chapters
            "dissertation": 300   # ~20+ chapters
        }
        return page_map.get(length, 100)

# Singleton instance
book_generator = BookGeneratorService()
