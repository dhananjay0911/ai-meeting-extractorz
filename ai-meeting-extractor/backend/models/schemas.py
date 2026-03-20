from pydantic import BaseModel
from typing import List, Optional


class Task(BaseModel):
    id:          int
    assigned_to: str
    task:        str
    deadline:    Optional[str] = None
    priority:    Optional[str] = "medium"
    confidence:  Optional[int] = 85
    raw_text:    Optional[str] = None


class ExtractionResponse(BaseModel):
    status:              str
    filename:            str
    file_type:           str
    transcript_preview:  str
    total_tasks:         int
    tasks:               List[Task]
