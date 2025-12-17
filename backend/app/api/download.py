"""Download endpoint with PDF/DOCX/EPUB conversion"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import logging
import subprocess
from pathlib import Path

from app.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

STORAGE_DIR = Path("/app/storage/books")

@router.get("/download/{book_id}")
async def download_book(book_id: str, format: str = "pdf"):
    """
    Download completed book in PDF, DOCX, or EPUB format
    Converts markdown to requested format using pandoc
    """
    try:
        logger.info(f"Download request: {book_id} (format: {format})")

        # Verify book exists and is complete
        pool = await get_db()
        async with pool.acquire() as conn:
            book = await conn.fetchrow("""
                SELECT status, outline FROM books WHERE book_id = $1
            """, book_id)

            if not book:
                raise HTTPException(status_code=404, detail="Book not found")

            if book["status"] != "complete":
                raise HTTPException(
                    status_code=400,
                    detail=f"Book is not ready yet. Status: {book['status']}"
                )

        # Check if book folder exists
        book_folder = STORAGE_DIR / book_id
        markdown_file = book_folder / "full_book.md"

        if not markdown_file.exists():
            raise HTTPException(
                status_code=404,
                detail="Book file not found. Please contact support."
            )

        # Convert to requested format
        if format == "pdf":
            output_file = book_folder / "book.pdf"
            subprocess.run([
                "pandoc",
                str(markdown_file),
                "-o", str(output_file),
                "--pdf-engine=xelatex",
                "-V", "geometry:margin=1in"
            ], check=True)
            media_type = "application/pdf"

        elif format == "docx":
            output_file = book_folder / "book.docx"
            subprocess.run([
                "pandoc",
                str(markdown_file),
                "-o", str(output_file)
            ], check=True)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        elif format == "epub":
            output_file = book_folder / "book.epub"
            subprocess.run([
                "pandoc",
                str(markdown_file),
                "-o", str(output_file)
            ], check=True)
            media_type = "application/epub+zip"

        else:
            raise HTTPException(status_code=400, detail="Invalid format. Use: pdf, docx, or epub")

        logger.info(f"✅ Book converted to {format}: {output_file}")

        # Return file for download
        return FileResponse(
            path=str(output_file),
            media_type=media_type,
            filename=f"book.{format}"
        )

    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Pandoc conversion failed: {e}")
        raise HTTPException(status_code=500, detail="File conversion failed")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Download failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
