# 🤖 AI Meeting Action Extractor

Extract actionable tasks, assignees and deadlines from any meeting transcript using **Gemini AI + Flask + React**.

## 🚀 Features
- Upload .txt, .docx, .pdf, .srt, .vtt files
- AI extracts tasks, owner names and deadlines automatically
- Filter by priority and assignee
- Dark theme dashboard UI

## 🧠 How It Works
1. Upload your meeting transcript file
2. Flask backend parses the file
3. Google Gemini AI extracts all action items
4. Results shown as task cards with assignee, deadline and priority

## 🛠️ Tech Stack
- **Frontend:** React + Vite
- **Backend:** Flask + Python
- **AI:** Google Gemini API (free tier)
- **Deployment:** Render (backend) + Vercel (frontend)

## ⚙️ Local Setup

### Backend
`ash
cd ai-meeting-extractor/backend
pip install -r requirements.txt
python main.py
`
Add .env file with:
`
GEMINI_API_KEY=your_key_here
`

### Frontend
`ash
cd ai-meeting-extractor/frontend
npm install
npm run dev
`

## 🌐 Live Demo
- Frontend: https://ai-meeting-extractorz.vercel.app
- Backend: https://ai-meeting-backend.onrender.com
