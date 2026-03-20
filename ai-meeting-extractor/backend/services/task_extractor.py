import os, json, re, urllib.request, urllib.error
from dotenv import load_dotenv
from models.schemas import Task
load_dotenv()

_PROMPT = """Extract every action item from this meeting transcript.
Reply with ONLY a JSON array starting with [ and ending with ].
No markdown, no explanation, nothing else.
Each item must have: assigned_to, task, deadline (or null), priority (high/medium/low), raw_text.
Return [] if no tasks found.

TRANSCRIPT:
{transcript}"""

def _get_working_model(key):
    for version in ["v1", "v1beta"]:
        try:
            url = f"https://generativelanguage.googleapis.com/{version}/models?key={key}"
            with urllib.request.urlopen(url, timeout=10) as r:
                data = json.loads(r.read().decode("utf-8"))
            for m in data.get("models", []):
                if "generateContent" in m.get("supportedGenerationMethods", []):
                    name = m["name"].replace("models/", "")
                    return name, version
        except:
            continue
    raise RuntimeError("No working Gemini model found for your API key.")

def _call_gemini(transcript):
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("GEMINI_API_KEY missing in .env")

    model_name, version = _get_working_model(key)

    url = f"https://generativelanguage.googleapis.com/{version}/models/{model_name}:generateContent?key={key}"

    body = json.dumps({
        "contents": [{"parts": [{"text": _PROMPT.format(transcript=transcript)}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 4096}
    }).encode("utf-8")

    req = urllib.request.Request(
        url, data=body,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode("utf-8"))
        return result["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Gemini API error: {e.read().decode('utf-8')}")

def _parse(raw):
    if not raw: return []
    t = re.sub(r"`json|`", "", raw).strip()
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

def extract_tasks(transcript):
    if len(transcript) > 15000:
        transcript = transcript[:15000] + "...[truncated]"
    raw   = _call_gemini(transcript)
    items = _parse(raw)
    tasks = []
    for i, item in enumerate(items):
        s = 70
        if item.get("assigned_to") and item["assigned_to"] != "Unassigned": s += 10
        if item.get("deadline"): s += 10
        if item.get("raw_text"): s += 5
        if item.get("task") and len(item["task"]) > 10: s += 5
        tasks.append(Task(
            id=i+1,
            assigned_to=item.get("assigned_to","Unassigned"),
            task=item.get("task",""),
            deadline=item.get("deadline"),
            priority=item.get("priority","medium"),
            confidence=min(s,98),
            raw_text=item.get("raw_text"),
        ))
    return tasks
