"""
Real Gemini Vision analysis for Civic-Eye.

This module is the only place that talks to the Gemini API. It reads the
API key from the GEMINI_API_KEY environment variable — it is never sent to
or read from the frontend.
"""

import json
import os

from google import genai
from google.genai import types

ALLOWED_CATEGORIES = [
    "Pothole",
    "Garbage/Waste",
    "Broken Streetlight",
    "Water Leakage",
    "Damaged Road/Infrastructure",
]

ALLOWED_SEVERITIES = ["Low", "Medium", "High", "Critical"]

MODEL_NAME = "gemini-3.6-flash"

PROMPT = f"""You are the image-classification component of Civic-Eye, a civic issue
reporting app.

Look at the attached photo and classify it into exactly ONE of these categories:
{", ".join(ALLOWED_CATEGORIES)}, Other.

Use "Other" if the photo does not clearly show one of the specific civic
issues listed above — never guess.

Respond with ONLY a JSON object (no markdown, no extra commentary) with
exactly these keys:
- "category": one of {ALLOWED_CATEGORIES + ["Other"]}
- "description": a short description of the issue actually visible in the image
- "severity": one of "Low", "Medium", "High", "Critical" — how urgent the
  issue looks from the photo. Use "Low" if category is "Other".
- "priority_score": integer from 0 to 100 — how urgently this should be
  addressed relative to other civic issues. Use 0 if category is "Other".
- "reason": a short explanation for the chosen severity and priority_score.
"""


class GeminiAnalysisError(Exception):
    """Raised whenever Gemini can't be reached or returns something unusable."""


def _get_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise GeminiAnalysisError("GEMINI_API_KEY is not configured on the server.")
    return genai.Client(api_key=api_key)


def _coerce_result(raw: dict) -> dict:
    """Validates/normalizes whatever Gemini returned into the fixed result shape."""
    category = raw.get("category")
    if category not in ALLOWED_CATEGORIES:
        category = "Other"

    severity = raw.get("severity")
    if category == "Other" or severity not in ALLOWED_SEVERITIES:
        severity = "Low"

    try:
        priority_score = int(round(float(raw.get("priority_score", 0))))
    except (TypeError, ValueError):
        priority_score = 0
    priority_score = max(0, min(100, priority_score))
    if category == "Other":
        priority_score = 0

    description = raw.get("description")
    if not isinstance(description, str) or not description.strip():
        description = (
            "No clearly identifiable civic issue was found in this image."
            if category == "Other"
            else f"Detected a likely {category.lower()} issue in the photo."
        )

    reason = raw.get("reason")
    if not isinstance(reason, str) or not reason.strip():
        reason = f"Classified as {severity} severity based on what's visible in the photo."

    return {
        "category": category,
        "description": description.strip(),
        "severity": severity,
        "priority_score": priority_score,
        "reason": reason.strip(),
    }


def analyze_image_bytes(image_bytes: bytes, mime_type: str) -> dict:
    """Sends the image to Gemini and returns a normalized analysis result."""
    client = _get_client()

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[
                PROMPT,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
    except Exception as exc:  # Gemini SDK / network errors of any kind
        raise GeminiAnalysisError(f"Gemini request failed: {exc}") from exc

    text = (response.text or "").strip()
    if not text:
        raise GeminiAnalysisError("Gemini returned an empty response.")

    try:
        raw = json.loads(text)
    except json.JSONDecodeError as exc:
        raise GeminiAnalysisError("Gemini returned a response that wasn't valid JSON.") from exc

    if not isinstance(raw, dict):
        raise GeminiAnalysisError("Gemini returned an unexpected response shape.")

    return _coerce_result(raw)
