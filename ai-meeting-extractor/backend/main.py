import os, json, re, io, zipfile, xml.etree.ElementTree as ET
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def root():
    return jsonify({
        "status": "running",
        "provider": "Google Gemini",
        "key_loaded": bool(os.environ.get("GEMINI_API_KEY"))
    })

@app.route('/api/extract', methods=['POST'])
def extract():
    if 'file' not in request.files:
        return jsonify({"detail": "No file uploaded"}), 400
    file = request.files['file']
    data = file.read()
    if not data:
        return jsonify({"detail": "File is empty"}), 400
    ext = Path(file.filename).suffix.lower()
    try:
        text = parse_file(ext, data)
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    if not text.strip():
        return jsonify({"detail": "No readable text found"}), 400
    try:
        tasks = extract_tasks(text)
    except Exception as e:
        return jsonify({"detail": str(e)}), 500
    preview = text[:300] + ("..." if len(text) > 300 else "")
    return jsonify({
        "status": "success",
        "filename": file.filename,
        "file_type": ext,
        "transcript_preview": preview,
        "total_tasks": len(tasks),
        "tasks": tasks
    })

@app.route('/api/supported-formats')
def formats():
    return jsonify({"formats": [
        {"ext": ".txt",  "label": "Plain Text"},
        {"ext": ".docx", "label": "Word Document"},
        {"ext": ".pdf",  "label": "PDF"},
        {"ext": ".srt",  "label": "Subtitle SRT"},
        {"ext": ".vtt",  "label": "Subtitle VTT"},
    ]})

def parse_file(ext, data):
    NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    if ext == ".txt":
        return data.decode("utf-8", errors="ignore").strip()
    elif ext == ".docx":
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            with z.open("word/document.xml") as f:
                root = ET.parse(f).getroot()
        lines = []
        for p in root.iter(f"{{{NS}}}p"):
            t = "".join(n.text for n in p.iter(f"{{{NS}}}t") if n.text).strip()
            if t: lines.append(t)
        return "\n".join(lines)
    elif ext == ".pdf":
        from pypdf import PdfReader
        r = PdfReader(io.BytesIO(data))
        return "\n".join(p.extract_text() for p in r.pages if p.extract_text())
    elif ext in [".srt", ".vtt"]:
        lines = []
        for line in data.decode("utf-8", errors="ignore").splitlines():
            line = line.strip()
            if not line or line.isdigit():
                continue
            if re.match(r"[\d:]+[\.,]\d+\s*-->", line):
                continue
            if line.startswith("WEBVTT"):
                continue
            lines.append(line)
        return "\n".join(lines)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

PROMPT = """Extract every action item from this meeting transcript.
Reply with ONLY a JSON array starting with [ and ending with ].
No markdown, no explanation, nothing else.
Each item must have: assigned_to, task, deadline (or null), priority (high/medium/low), raw_text.
Return [] if no tasks found.

TRANSCRIPT:
{transcript}"""

def extract_tasks(transcript):
    import urllib.request, urllib.error
    if len(transcript) > 15000:
        transcript = transcript[:15000] + "...[truncated]"
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("GEMINI_API_KEY missing")
    for version in ["v1", "v1beta"]:
        try:
            url = f"https://generativelanguage.googleapis.com/{version}/models?key={key}"
            with urllib.request.urlopen(url, timeout=10) as r:
                models = json.loads(r.read().decode("utf-8"))
            for m in models.get("models", []):
                if "generateContent" in m.get("supportedGenerationMethods", []):
                    model_name = m["name"].replace("models/", "")
                    api_url = f"https://generativelanguage.googleapis.com/{version}/models/{model_name}:generateContent?key={key}"
                    body = json.dumps({
                        "contents": [{"parts": [{"text": PROMPT.format(transcript=transcript)}]}],
                        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 4096}
                    }).encode("utf-8")
                    req = urllib.request.Request(
                        api_url, data=body,
                        headers={"Content-Type": "application/json"},
                        method="POST"
                    )
                    with urllib.request.urlopen(req, timeout=60) as resp:
                        result = json.loads(resp.read().decode("utf-8"))
                    raw = result["candidates"][0]["content"]["parts"][0]["text"]
                    return parse_json(raw)
        except Exception:
            continue
    raise RuntimeError("Gemini API call failed")

def parse_json(raw):
    if not raw: return []
    t = re.sub(r"```json|```", "", raw).strip()
    try:
        r = json.loads(t)
        return r if isinstance(r, list) else []
    except: pass
    a, b = t.find("["), t.rfind("]")
    if a != -1 and b > a:
        try:
            r = json.loads(t[a:b+1])
            return r if isinstance(r, list) else []
        except: pass
    return []

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)