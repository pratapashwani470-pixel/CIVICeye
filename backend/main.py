import os

from dotenv import load_dotenv

# Must run before importing gemini_service so GEMINI_API_KEY is already
# in os.environ when that module reads it.
load_dotenv()

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from gemini_service import GeminiAnalysisError, analyze_image_bytes
from complaint_api import router as complaint_router

app = FastAPI(title="Civic-Eye Backend", version="0.1.0")
app.include_router(complaint_router)

# Comma-separated list, e.g. "http://localhost:5173,http://localhost:4173"
_allowed_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in _allowed_origins.split(",") if origin.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    # --- image validation ---
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file.")

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image is too large. Please upload a file under 10MB.")

    # --- Gemini analysis ---
    try:
        result = analyze_image_bytes(image_bytes, file.content_type)
    except GeminiAnalysisError as exc:
        message = str(exc)
        # Log the real reason server-side for debugging; never echo internals
        # (or the key) back to the client.
        print(f"[Civic-Eye] Gemini analysis failed: {message}")

        if "GEMINI_API_KEY is not configured" in message:
            raise HTTPException(
                status_code=500,
                detail="Server is missing its Gemini API key. Check the backend .env file.",
            ) from exc

        raise HTTPException(
            status_code=502,
            detail="AI analysis is temporarily unavailable. Please try again.",
        ) from exc

    return result
