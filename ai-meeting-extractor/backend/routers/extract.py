from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import ExtractionResponse
from services.file_parser import parse_file
from services.task_extractor import extract_tasks

router = APIRouter()


@router.post("/extract", response_model=ExtractionResponse)
async def extract(file: UploadFile = File(...)):

    # Read file bytes
    data = await file.read()

    if not data:
        raise HTTPException(400, "Uploaded file is empty.")

    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(413, "File too large. Maximum size is 10 MB.")

    # Parse file to plain text
    try:
        text, file_type = parse_file(file.filename, data)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    except Exception as e:
        raise HTTPException(500, f"Could not read file: {e}")

    if not text.strip():
        raise HTTPException(400, "No readable text found in the file.")

    # Extract tasks with Gemini
    try:
        tasks = extract_tasks(text)
    except RuntimeError as e:
        raise HTTPException(500, str(e))
    except Exception as e:
        raise HTTPException(500, f"Task extraction failed: {e}")

    preview = text[:300] + ("..." if len(text) > 300 else "")

    return ExtractionResponse(
        status              = "success",
        filename            = file.filename,
        file_type           = file_type,
        transcript_preview  = preview,
        total_tasks         = len(tasks),
        tasks               = tasks,
    )


@router.get("/supported-formats")
def formats():
    return {
        "formats": [
            {"ext": ".txt",  "label": "Plain Text"},
            {"ext": ".docx", "label": "Word Document"},
            {"ext": ".pdf",  "label": "PDF"},
            {"ext": ".srt",  "label": "Subtitle SRT"},
            {"ext": ".vtt",  "label": "Subtitle VTT"},
        ]
    }
