"""\nAI Generation Service using OpenAI API\nReplaces placeholder MCP calls with real AI generation\n"""
import json
import logging
import asyncio
from typing import Dict, Any
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)

class AIGenerator:
    """Generate book content using GPT-4"""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o"  # Using GPT-4o

    async def generate_outline(
        self,
        topic: str,
        audience: str,
        length: str,
        style: str,
        additional_instructions: str = ""
    ) -> Dict[str, Any]:
        """Generate book outline using Claude"""

        chapter_count = self._get_chapter_count(length)

        prompt = f"""Create a detailed book outline for: "{topic}"

Target audience: {audience}
Book length: {length} (~{chapter_count} chapters)
Writing style: {style}
{f"Additional instructions: {additional_instructions}" if additional_instructions else ""}

Generate a JSON response with this exact structure:
{{
  "title": "Compelling book title",
  "subtitle": "Descriptive subtitle",
  "chapters": [
    {{
      "number": 1,
      "title": "Chapter title",
      "focus": "Main focus of this chapter",
      "key_points": ["point 1", "point 2", "point 3"]
    }},
    ... (total of {chapter_count} chapters)
  ]
}}

Make it practical, engaging, and tailored for {audience}. Return ONLY the JSON, no other text."""

        logger.info(f"Generating outline for '{topic}' with {chapter_count} chapters...")

        try:
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=self.model,
                max_tokens=4000,
                temperature=0.7,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            # Extract JSON from response
            response_text = response.choices[0].message.content

            # Try to parse JSON (Claude might wrap it in ```json blocks)
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]

            outline = json.loads(response_text.strip())
            logger.info(f"✅ Outline generated: {outline['title']}")

            return outline

        except Exception as e:
            logger.error(f"❌ Outline generation failed: {e}")
            raise

    async def generate_chapter(
        self,
        chapter_num: int,
        chapter_info: Dict[str, Any],
        book_title: str,
        audience: str,
        style: str
    ) -> str:
        """Generate one chapter using Claude"""

        prompt = f"""Write Chapter {chapter_num} of the book "{book_title}".

Chapter title: "{chapter_info['title']}"
Focus: {chapter_info['focus']}
Key points to cover: {', '.join(chapter_info['key_points'])}

Target audience: {audience}
Writing style: {style}
Length: 3,000-4,000 words

Requirements:
- Start with an engaging opening (story, scenario, or question)
- Make it practical with real-world examples
- Use clear, accessible language for {audience}
- Include actionable insights
- End with a strong conclusion

Write the complete chapter in markdown format."""

        logger.info(f"Generating Chapter {chapter_num}: {chapter_info['title']}...")

        try:
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=self.model,
                max_tokens=8000,
                temperature=0.7,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            chapter_content = response.choices[0].message.content
            word_count = len(chapter_content.split())

            logger.info(f"✅ Chapter {chapter_num} generated: {word_count} words")

            return chapter_content

        except Exception as e:
            logger.error(f"❌ Chapter {chapter_num} generation failed: {e}")
            raise

    def _get_chapter_count(self, length: str) -> int:
        """Get chapter count based on book length"""
        length_map = {
            "short": 6,        # 5-7 chapters
            "standard": 10,    # 8-12 chapters
            "comprehensive": 17, # 15-20 chapters
            "dissertation": 22   # 20+ chapters
        }
        return length_map.get(length, 10)

# Singleton
ai_generator = AIGenerator()
