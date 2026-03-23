# ai-meeting-extractorz
# 🤖 AI Meeting Action Extractor

> Automatically extract actionable tasks, assignees, and deadlines from any meeting transcript using **Google Gemini AI + FastAPI + React**.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React](https://img.shields.io/badge/React-18-blue)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📌 What is This?

After every meeting, team members forget who was assigned what task and when it was due. This tool solves that problem.

You upload a meeting transcript file → AI reads it → extracts every action item → shows tasks with assignee names, deadlines, and priority levels in a clean dashboard.

---

---

## ✨ Features

| Feature | Description |
|---|---|
| 📂 Multi-format Upload | Supports `.txt`, `.docx`, `.pdf`, `.srt`, `.vtt` |
| 🤖 Gemini AI Extraction | Google Gemini reads transcript and extracts every task |
| 👤 Assignee Detection | Identifies who is responsible for each task |
| 📅 Deadline Detection | Finds dates like "Monday", "Tomorrow", "by EOD" |
| 🔴 Priority Scoring | High / Medium / Low based on urgency language |
| 📊 Confidence Score | Each task gets an accuracy percentage |
| 🔍 Filter & Search | Filter by priority, assignee, or search keywords |
| 📋 Source Quotes | Expand any task to see the original transcript line |
| 🌙 Dark Theme UI | Polished dark SaaS-style design |
| 🖱️ Drag & Drop | Drop files directly onto the upload zone |

---

## 🧠 How It Works

```
User uploads file
      ↓
File Parser (built-in Python)
  .txt  → decode UTF-8
  .docx → zipfile + xml parser
  .pdf  → pypdf text extraction
  .srt  → strip timestamps
  .vtt  → strip timestamps
      ↓
Clean transcript text
      ↓
Google Gemini REST API
  → Sends transcript with structured prompt
  → Gemini returns JSON array of tasks
  → Auto-detects working model from your API key
      ↓
JSON Parser
  → Strips markdown fences
  → Extracts clean JSON array
      ↓
Confidence Scoring
  → Assignee found   +10
  → Deadline found   +10
  → Raw quote found  +5
  → Task length > 10 +5
  → Base score       70
      ↓
React Dashboard
  → Task cards with filters, search, sort
```

---

## 📁 Project Structure

```
ai-meeting-extractor/
├── render.yaml                      # Render deployment config
│
├── backend/
│   ├── main.py                      # FastAPI app entry point
│   ├── requirements.txt             # Python dependencies
│   ├── .env                         # API keys (not in git)
│   ├── runtime.txt                  # Python version for Render
│   ├── routers/
│   │   └── extract.py               # POST /api/extract endpoint
│   ├── services/
│   │   ├── file_parser.py           # Parses all file types
│   │   └── task_extractor.py        # Gemini API call + JSON parser
│   └── models/
│       └── schemas.py               # Pydantic request/response models
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx                 # React entry point
        ├── App.jsx                  # Root component + state
        ├── App.css                  # Global design tokens
        ├── api/
        │   └── meetingApi.js        # Axios API calls
        └── components/
            ├── Header/              # Header.jsx + Header.css
            ├── UploadSection/       # Upload zone + file validation
            ├── Stats/               # Summary stat cards
            ├── Dashboard/           # Filter + search + task grid
            ├── TaskCard/            # Individual task card
            └── Footer/              # Footer
```

---

## 🔑 Getting the Gemini API Key (Free)

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIzaSy...`)
5. Free tier gives **1,500 requests/day**

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11
- Node.js 18+
- npm

### Backend Setup

```bash
# 1. Navigate to backend
cd ai-meeting-extractor/backend

# 2. Create virtual environment
python -m venv venv

# Windows activate:
venv\Scripts\activate

# Mac/Linux activate:
source venv/bin/activate

# 3. Install packages
pip install -r requirements.txt

# 4. Create .env file
echo GEMINI_API_KEY=your_key_here > .env

# 5. Start server
python -m uvicorn main:app --reload
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

### Frontend Setup

```bash
# 1. Navigate to frontend
cd ai-meeting-extractor/frontend

# 2. Install packages
npm install

# 3. Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

> Vite proxy automatically forwards `/api` calls to `http://localhost:8000` — no extra config needed.

---

## 🧪 Test with Sample Transcript

Create a file called `sample.txt` and paste this:

```
[00:02] Manager: Alright team, let's go over action items from today.
[00:10] Dhananjay: I'll prepare the sales report by Monday and share it with the team.
[00:22] Riya: I can send the marketing data by tomorrow. Also, I need access to the analytics dashboard.
[00:35] Manager: Riya, I'll get you that access by end of day. Dhananjay, also review the client feedback before Friday.
[01:05] Priya: I'll update the project timeline and send it to everyone by Wednesday.
[01:15] Manager: Let's schedule a follow-up call for next Monday at 10 AM. Dhananjay, can you send the calendar invite?
```

Upload it → click **Extract Tasks** → see all 6 tasks with assignees, deadlines, and priorities.

---

## 🌐 API Reference

### `POST /api/extract`

Upload a transcript file and receive extracted tasks.

**Request:** `multipart/form-data` with field `file`

**Response:**
```json
{
  "status": "success",
  "filename": "sample.txt",
  "file_type": "Plain Text",
  "transcript_preview": "Alright team...",
  "total_tasks": 6,
  "tasks": [
    {
      "id": 1,
      "assigned_to": "Dhananjay",
      "task": "Prepare the sales report and share with team",
      "deadline": "Monday",
      "priority": "high",
      "confidence": 95,
      "raw_text": "I'll prepare the sales report by Monday..."
    }
  ]
}
```

### `GET /api/supported-formats`

Returns all supported file extensions.

**Response:**
```json
{
  "formats": [
    {"ext": ".txt", "label": "Plain Text"},
    {"ext": ".docx", "label": "Word Document"},
    {"ext": ".pdf", "label": "PDF Document"},
    {"ext": ".srt", "label": "SubRip Subtitle"},
    {"ext": ".vtt", "label": "WebVTT Subtitle"}
  ]
}
```

---

## 📦 Dependencies

### Backend

| Package | Version | Purpose |
|---|---|---|
| `fastapi` | 0.115.0 | Web API framework |
| `uvicorn` | 0.30.6 | ASGI server |
| `pydantic` | 2.11.7 | Data validation |
| `google-generativeai` | 0.7.2 | Gemini AI SDK |
| `pypdf` | 4.3.1 | PDF text extraction |
| `python-multipart` | 0.0.9 | File upload support |
| `python-dotenv` | 1.0.1 | Load `.env` file |

### Frontend

| Package | Version | Purpose |
|---|---|---|
| `react` | 18.x | UI framework |
| `vite` | 5.x | Build tool + dev server |
| `axios` | 1.x | HTTP API calls |

---

## 🚀 Deployment

### Backend → Render (Free)

1. Go to **https://render.com** → sign up with GitHub
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Set these values:

| Field | Value |
|---|---|
| Root Directory | `ai-meeting-extractor/backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port 10000` |

5. Add environment variable:
   - `GEMINI_API_KEY` = your key
   - `PYTHON_VERSION` = `3.11.9`
6. Click **Create Web Service**

### Frontend → Vercel (Free)

1. Go to **https://vercel.com** → sign up with GitHub
2. Click **Add New Project** → import your repo
3. Set:

| Field | Value |
|---|---|
| Root Directory | `ai-meeting-extractor/frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. Click **Deploy**

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| `GEMINI_API_KEY missing` | Create `.env` in `backend/` with your key |
| `CORS error` | Make sure backend is running on port 8000 |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` in venv |
| `Port already in use` | Use `uvicorn main:app --reload --port 8001` |
| `PDF not parsing` | PDF must have selectable text, not scanned image |
| Render deploy fails | Set `PYTHON_VERSION=3.11.9` in Render environment variables |
| Frontend can't reach backend | Update `API_BASE` in `meetingApi.js` to your Render URL |

---

## 🗂️ Supported File Types

| Extension | Type | Parser Used |
|---|---|---|
| `.txt` | Plain Text | Python built-in decode |
| `.docx` | Word Document | Python `zipfile` + `xml` |
| `.pdf` | PDF | `pypdf` |
| `.srt` | SubRip Subtitle | Regex timestamp removal |
| `.vtt` | WebVTT Subtitle | Regex timestamp removal |

---

## 👨‍💻 Built By

**Dhananjay** — Portfolio Project

Tech Stack: `Google Gemini AI` · `FastAPI` · `React` · `Vite` · `Python 3.11`

---

## 📄 License

MIT License — free to use, modify, and distribute.
