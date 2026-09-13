// Talks to the Civic-Eye FastAPI backend, which forwards the image to
// Gemini and returns a structured result. The Gemini API key never touches
// this file or any other frontend code — it lives only in backend/.env.

const API_BASE_URL = "";

export class AnalyzeError extends Error {}

/**
 * Uploads an image to the backend for real AI analysis.
 *
 * @param {File} file
 * @returns {Promise<{ issueType: string, confidence: number, severity: string, description: string, priority: number }>}
 */
export async function analyzeImage(file) {
  if (!file) {
    throw new AnalyzeError("Please upload an image first.");
  }
  if (!file.type || !file.type.startsWith("image/")) {
    throw new AnalyzeError("That file doesn't look like an image. Please upload a photo.");
  }

  const formData = new FormData();
  formData.append("file", file);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new AnalyzeError("Couldn't reach the Civic-Eye backend. Is it running on port 8000?");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Response wasn't JSON — payload stays null and is handled below.
  }

  if (!response.ok) {
    throw new AnalyzeError(payload?.detail || "The server couldn't analyze this image. Please try again.");
  }

  return payload;
}
