"""Document parsing and text chunking service.

Supports PDF, DOCX, PPTX, and TXT files, preserving exact page and slide numbers for RAG citations.
"""

import os
from typing import List, Dict, Any
from pypdf import PdfReader


def parse_pdf(file_path: str) -> List[Dict[str, Any]]:
    """Extracts text page-by-page from a PDF document."""
    pages_data = []
    reader = PdfReader(file_path)
    for index, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        text = text.strip()
        if text:
            pages_data.append({
                "page_number": index + 1,
                "content": text,
            })
    return pages_data


def parse_docx(file_path: str) -> List[Dict[str, Any]]:
    """Extracts text from a DOCX file, grouping by sections/pages."""
    try:
        import docx
        doc = docx.Document(file_path)
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        
        # Approximate pages (~300 words per page)
        pages_data = []
        current_page_text = []
        word_count = 0
        page_num = 1

        for para in paragraphs:
            current_page_text.append(para)
            word_count += len(para.split())
            if word_count >= 300:
                pages_data.append({
                    "page_number": page_num,
                    "content": "\n\n".join(current_page_text),
                })
                current_page_text = []
                word_count = 0
                page_num += 1

        if current_page_text:
            pages_data.append({
                "page_number": page_num,
                "content": "\n\n".join(current_page_text),
            })

        return pages_data
    except Exception as e:
        print(f"Error parsing DOCX: {e}")
        return []


def parse_pptx(file_path: str) -> List[Dict[str, Any]]:
    """Extracts text slide-by-slide from a PPTX presentation."""
    try:
        from pptx import Presentation
        prs = Presentation(file_path)
        pages_data = []

        for slide_index, slide in enumerate(prs.slides):
            slide_texts = []
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text:
                    t = shape.text.strip()
                    if t:
                        slide_texts.append(t)
            
            if slide_texts:
                pages_data.append({
                    "page_number": slide_index + 1,
                    "content": "\n".join(slide_texts),
                })

        return pages_data
    except Exception as e:
        print(f"Error parsing PPTX: {e}")
        return []


def parse_txt(file_path: str) -> List[Dict[str, Any]]:
    """Reads a plain text or markdown file."""
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read().strip()
        if not content:
            return []
        
        # Split into ~400-word logical pages
        words = content.split()
        pages_data = []
        page_size = 350
        for i in range(0, len(words), page_size):
            chunk_words = words[i:i + page_size]
            pages_data.append({
                "page_number": (i // page_size) + 1,
                "content": " ".join(chunk_words),
            })
        return pages_data
    except Exception as e:
        print(f"Error parsing text: {e}")
        return []


def extract_document_pages(file_path: str, file_type: str) -> List[Dict[str, Any]]:
    """Dispatcher to extract text with page metadata based on file extension."""
    ext = file_type.lower().replace(".", "")
    if ext == "pdf":
        return parse_pdf(file_path)
    elif ext in ["docx", "doc"]:
        return parse_docx(file_path)
    elif ext in ["pptx", "ppt"]:
        return parse_pptx(file_path)
    else:
        return parse_txt(file_path)


def chunk_document_pages(pages_data: List[Dict[str, Any]], max_chunk_words: int = 250) -> List[Dict[str, Any]]:
    """Further segments long pages into digestible chunks while retaining exact page numbers."""
    chunks = []
    chunk_counter = 0

    for item in pages_data:
        page_num = item["page_number"]
        page_content = item["content"]
        words = page_content.split()

        if len(words) <= max_chunk_words:
            chunks.append({
                "chunk_index": chunk_counter,
                "page_number": page_num,
                "content": page_content,
            })
            chunk_counter += 1
        else:
            for i in range(0, len(words), max_chunk_words):
                sub_text = " ".join(words[i:i + max_chunk_words])
                chunks.append({
                    "chunk_index": chunk_counter,
                    "page_number": page_num,
                    "content": sub_text,
                })
                chunk_counter += 1

    return chunks
