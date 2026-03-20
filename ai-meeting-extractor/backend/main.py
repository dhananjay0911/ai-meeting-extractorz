import os
from dotenv import load_dotenv

load_dotenv()   # loads .env before anything else

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import extract

app = FastAPI(title="AI Meeting Action Extractor", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extract.router, prefix="/api")


@app.get("/")
def root():
    return {
        "status":     "running",
        "provider":   "Google Gemini",
        "key_loaded": bool(os.environ.get("GEMINI_API_KEY")),
    }
