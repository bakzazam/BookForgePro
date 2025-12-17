"""\nFull book generation service\nGenerates all chapters in parallel after payment\n"""
import asyncio
import logging
import os
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime
import json

from services.ai_generator import ai_generator
from app.database import get_db

logger = logging.getLogger(__name__)

# Base storage directory (inside Docker container)
STORAGE_DIR = Path("/app/storage/books")

async def generate_full_book(book_id: str):
    """
    Generate complete book (all chapters) in parallel
    Called after successful payment
    """
    try:
        logger.info(f"🚀 Starting full book generation for: {book_id}")

        # Create book folder
        book_folder = STORAGE_DIR / book_id
        book_folder.mkdir(parents=True, exist_ok=True)
        logger.info(f"📁 Created book folder: {book_folder}")

        # Get book data from database
        pool = await get_db()
        async with pool.acquire() as conn:
            book = await conn.fetchrow("""
                SELECT outline, topic, audience, style, chapter_1 FROM books
                WHERE book_id = $1
            """, book_id)

            if not book:
                logger.error(f"Book {book_id} not found")
                return

            outline = json.loads(book["outline"]) if isinstance(book["outline"], str) else book["outline"]
            audience = book["audience"]
            style = book["style"]
            chapter_1 = book["chapter_1"]

        # Save Chapter 1 (already generated during preview)
        chapter_1_file = book_folder / "chapter_01.md"
        chapter_1_file.write_text(chapter_1, encoding='utf-8')
        logger.info(f"💾 Saved Chapter 1")

        # Save outline
        outline_file = book_folder / "outline.json"
        outline_file.write_text(json.dumps(outline, indent=2), encoding='utf-8')

        # Update progress
        await update_progress(book_id, 5, "Preparing to generate chapters...")

        # Generate remaining chapters (skip chapter 1, already done)
        chapters_to_generate = outline["chapters"][1:]  # Skip first chapter
        total_chapters = len(chapters_to_generate)

        logger.info(f"Generating {total_chapters} chapters in parallel...")

        # Generate all chapters in parallel
        tasks = []
        for i, chapter_info in enumerate(chapters_to_generate, start=2):
            task = generate_chapter_with_progress(
                book_id=book_id,
                chapter_num=i,
                chapter_info=chapter_info,
                book_title=outline["title"],
                audience=audience,
                style=style,
                total_chapters=total_chapters + 1  # +1 for chapter 1
            )
            tasks.append(task)

        # Wait for all chapters to complete
        chapters = await asyncio.gather(*tasks, return_exceptions=True)

        # Check for errors
        failed_chapters = [i for i, ch in enumerate(chapters, start=2) if isinstance(ch, Exception)]
        if failed_chapters:
            logger.error(f"Chapters {failed_chapters} failed to generate")
            await update_progress(book_id, 100, f"Failed to generate some chapters", status="failed")
            return

        logger.info(f"✅ All {total_chapters} chapters generated successfully!")

        # Update to 95%
        await update_progress(book_id, 95, "Assembling final book...")

        # Assemble all chapters into one markdown file
        full_book_path = book_folder / "full_book.md"
        with open(full_book_path, 'w', encoding='utf-8') as f:
            f.write(f"# {outline['title']}\n\n")
            f.write(f"*{outline['subtitle']}*\n\n")
            f.write("---\n\n")

            # Add Chapter 1
            f.write(chapter_1 + "\n\n")

            # Add remaining chapters
            for i, content in enumerate(chapters, start=2):
                if not isinstance(content, Exception):
                    f.write(content + "\n\n")

        logger.info(f"📄 Full book assembled: {full_book_path}")

        # Mark as complete
        async with pool.acquire() as conn:
            await conn.execute("""
                UPDATE books
                SET status = 'complete',
                    progress = 100,
                    current_step = 'Complete!',
                    completed_at = $1,
                    download_url = $2
                WHERE book_id = $3
            """, datetime.utcnow(), f"/books/{book_id}/full_book.md", book_id)

        await update_progress(book_id, 100, "Complete!", status="complete")

        logger.info(f"🎉 Book generation complete: {book_id}")

    except Exception as e:
        logger.error(f"❌ Book generation failed: {e}")
        await update_progress(book_id, 0, f"Generation failed: {str(e)}", status="failed")


async def generate_chapter_with_progress(
    book_id: str,
    chapter_num: int,
    chapter_info: Dict[str, Any],
    book_title: str,
    audience: str,
    style: str,
    total_chapters: int
) -> str:
    """Generate one chapter and update progress"""
    try:
        logger.info(f"Generating Chapter {chapter_num}/{total_chapters}")

        # Generate the chapter
        content = await ai_generator.generate_chapter(
            chapter_num=chapter_num,
            chapter_info=chapter_info,
            book_title=book_title,
            audience=audience,
            style=style
        )

        # Save chapter to file
        book_folder = STORAGE_DIR / book_id
        chapter_file = book_folder / f"chapter_{chapter_num:02d}.md"
        chapter_file.write_text(content, encoding='utf-8')
        logger.info(f"💾 Saved Chapter {chapter_num}")

        # Update progress
        progress = int(5 + ((chapter_num - 1) / total_chapters) * 90)
        await update_progress(book_id, progress, f"Completed chapter {chapter_num} of {total_chapters}")

        logger.info(f"✅ Chapter {chapter_num} complete")

        return content

    except Exception as e:
        logger.error(f"❌ Chapter {chapter_num} failed: {e}")
        raise


async def update_progress(book_id: str, progress: int, step: str, status: str = None):
    """Update book generation progress in database"""
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            if status:
                await conn.execute("""
                    UPDATE books
                    SET progress = $1, current_step = $2, status = $3
                    WHERE book_id = $4
                """, progress, step, status, book_id)
            else:
                await conn.execute("""
                    UPDATE books
                    SET progress = $1, current_step = $2
                    WHERE book_id = $3
                """, progress, step, book_id)

        logger.info(f"Progress updated: {progress}% - {step}")

    except Exception as e:
        logger.error(f"Failed to update progress: {e}")
