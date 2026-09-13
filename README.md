# Civic-Eye — Frontend + FastAPI/Gemini Backend

AI-powered civic issue reporting platform. Home page, Report Issue flow
(upload → real Gemini analysis → location confirmation with a live map →
submit), and a Citizen Dashboard — still no database, no auth.

## Run it

**1. Backend (FastAPI + Gemini)**

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # then paste your real key into backend/.env
uvicorn main:app --reload --port 8000
```

**2. Frontend (React + Vite)**

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173). The
frontend calls the backend at `http://localhost:8000` by default — override
with `VITE_API_BASE_URL` in a `.env` file at the project root if needed.

## Stack

- React 18 + Vite, Tailwind CSS, React Router (`/`, `/report`, `/dashboard`), lucide-react
- Leaflet + react-leaflet for the location map, browser Geolocation API for
  positioning, OpenStreetMap Nominatim for reverse geocoding (no API key)
- FastAPI backend (`backend/`) that forwards the uploaded image to the
  Gemini API (`google-genai`) and returns a structured JSON result

## Project structure

```
src/
  components/  Navbar, Footer, Button, IssueCard, ProcessStep, ImageUploader,
               AIResultCard, LocationPicker, SummaryCard, ReportCard
  pages/       Home.jsx, Report.jsx, Dashboard.jsx
  utils/       api.js (calls the backend), geocode.js (Nominatim reverse geocoding)
  App.jsx, main.jsx, index.css
backend/
  main.py            FastAPI app, /api/analyze endpoint
  gemini_service.py  Gemini call + response validation
  requirements.txt
  .env.example       copy to .env and add your real GEMINI_API_KEY
```

## What works today

- Home → Report Issue → upload/drag-drop/take a photo → preview it
- "Analyze Issue" sends the image to the backend, which calls Gemini Vision
  and classifies it as one of: Pothole, Garbage/Waste, Broken Streetlight,
  Water Leakage, Damaged Road/Infrastructure, or Other
- The AI Analysis card shows the real detected category, severity, priority
  score, and a short AI-written description + reasoning
- "Yes" moves to **Confirm Location**, which uses the browser's real
  Geolocation API (no mock data): it asks permission, gets your actual
  coordinates + accuracy, reverse-geocodes them into an address via
  OpenStreetMap's Nominatim service, and shows a Leaflet/OpenStreetMap map
  with a **draggable pin** so you can correct the spot if the issue isn't
  exactly where you're standing
- "Confirm Location" moves to a submission success screen; "Change" resets
  back to upload

## Note on testing location

Browsers only allow the Geolocation API on secure contexts — `localhost` is
fine, but it will silently fail on a plain `http://<lan-ip>` address. Use
`http://localhost:5173` (or serve over HTTPS) when testing.

## Day 2/3 (not built yet)

- "Explore Issues" public map view (all citizens' reports)
- Backend + MongoDB persistence for submitted reports
- Authentication
- Actually routing submitted reports to a city system

