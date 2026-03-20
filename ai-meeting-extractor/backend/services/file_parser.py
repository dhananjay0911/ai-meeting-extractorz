"""
Parses meeting transcript files.

- .txt  → built-in decode
- .docx → built-in zipfile + xml (NO python-docx needed)
- .pdf  → pypdf  (pip install pypdf==4.3.1)
- .srt  → built-in regex
- .vtt  → built-in regex
"""

import re
import io
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path


SUPPORTED = {
    ".txt":  "Plain Text",
    ".docx": "Word Document",
    ".pdf":  "PDF",
    ".srt":  "Subtitle (SRT)",
    ".vtt":  "Subtitle (VTT)",
}

WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def _parse_txt(data: bytes) -> str:
    return data.decode("utf-8", errors="ignore").strip()


def _parse_docx(data: bytes) -> str:
    # .docx is a ZIP — word/document.xml holds all text
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        with z.open("word/document.xml") as f:
            root = ET.parse(f).getroot()

    lines = []
    for para in root.iter(f"{{{WORD_NS}}}p"):
        parts = [
            node.text
            for node in para.iter(f"{{{WORD_NS}}}t")
            if node.text
        ]
        line = "".join(parts).strip()
        if line:
            lines.append(line)
    return "\n".join(lines)


def _parse_pdf(data: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        raise RuntimeError(
            "pypdf not installed.\n"
            "Open terminal and run:  pip install pypdf==4.3.1"
        )
    reader = PdfReader(io.BytesIO(data))
    pages = []
    for page in reader.pages:
        t = page.extract_text()
        if t and t.strip():
            pages.append(t.strip())
    return "\n".join(pages)


def _parse_srt(data: bytes) -> str:
    lines = []
    for line in data.decode("utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line or line.isdigit():
            continue
        if re.match(r"\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->", line):
            continue
        lines.append(line)
    return "\n".join(lines)


def _parse_vtt(data: bytes) -> str:
    lines = []
    for line in data.decode("utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line or line.startswith("WEBVTT"):
            continue
        if re.match(r"[\d:]+\.\d+\s*-->", line):
            continue
        if line.startswith(("NOTE", "STYLE", "REGION")):
            continue
        lines.append(line)
    return "\n".join(lines)


_PARSERS = {
    ".txt":  _parse_txt,
    ".docx": _parse_docx,
    ".pdf":  _parse_pdf,
    ".srt":  _parse_srt,
    ".vtt":  _parse_vtt,
}


def parse_file(filename: str, data: bytes) -> tuple:
    """
    Returns (text: str, file_type: str)
    Raises ValueError for unsupported types.
    """
    ext = Path(filename).suffix.lower()
    if ext not in _PARSERS:
        raise ValueError(
            f"Unsupported file type: '{ext}'. "
            f"Allowed: {', '.join(_PARSERS)}"
        )
    return _PARSERS[ext](data), SUPPORTED[ext]
