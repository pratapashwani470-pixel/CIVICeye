import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Loader2, Check, RotateCcw, CheckCircle2, ArrowLeft } from "lucide-react";
import Button from "../components/Button.jsx";
import ImageUploader from "../components/ImageUploader.jsx";
import AIResultCard from "../components/AIResultCard.jsx";
import LocationPicker from "../components/LocationPicker.jsx";
import { analyzeImage, AnalyzeError } from "../utils/api.js";
import { addComplaint } from "../utils/complaintsStore.js";
const API_BASE_URL = "http://127.0.0.1:8000";

/** Converts a File to a base64 data URL so the image can be persisted to
 * localStorage alongside the rest of the complaint. */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const STEPS = ["Upload", "Analyze", "Location", "Submit"];

function StepIndicator({ current }) {
  return (
    <ol className="mb-10 flex items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "upcoming";
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3">
            <div
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium ${
                state === "active"
                  ? "bg-civic-600 text-white"
                  : state === "done"
                  ? "bg-signal-50 text-signal-700"
                  : "bg-white text-ink-300 border border-ink-100"
              }`}
            >
              {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <span>{i + 1}</span>}
              {label}
            </div>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-ink-100 sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}

export default function Report() {
  const [image, setImage] = useState(null); // { file, url }
  const [stage, setStage] = useState("upload"); // upload | analyzing | result | location | submitted
  const [result, setResult] = useState(null); // { category, description, severity, priority_score, reason }
  const [error, setError] = useState("");
  const [confirmedLocation, setConfirmedLocation] = useState(null); // { latitude, longitude, accuracy, address }
  const [savedComplaintId, setSavedComplaintId] = useState(null);

  const handleImageSelected = (file) => {
    setImage({ file, url: URL.createObjectURL(file) });
    // A new photo invalidates any previous analysis.
    setResult(null);
    setError("");
  };

  const handleClearImage = () => {
    if (image) URL.revokeObjectURL(image.url);
    setImage(null);
    setResult(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    setError("");
    setStage("analyzing");

    try {
      const analysis = await analyzeImage(image.file);
      setResult(analysis);
      setStage("result");
    } catch (err) {
      setError(err instanceof AnalyzeError ? err.message : "Something went wrong. Please try again.");
      setStage("upload");
    }
  };

  const handleChange = () => {
    handleClearImage();
    setConfirmedLocation(null);
    setSavedComplaintId(null);
    setStage("upload");
  };

  const handleLocationConfirmed = async (locationData) => {
  setConfirmedLocation(locationData);
  setError("");

  let imageDataUrl = null;

  if (image?.file) {
    try {
      imageDataUrl = await fileToDataUrl(image.file);
    } catch {
      imageDataUrl = null;
    }
  }

  const complaintData = {
    complaint_id: `CE-${Date.now()}`,
    category: result?.category ?? "Other",
    description: result?.description ?? "",
    severity: result?.severity ?? "Low",
    priority_score: result?.priority_score ?? 0,
    priority_reason: result?.reason ?? "",
    location: {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: locationData.address,
      accuracy: locationData.accuracy,
    },
    image: imageDataUrl,
    status: "Submitted",
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(complaintData),
    });

    if (!response.ok) {
      throw new Error("Failed to save complaint to the server.");
    }

    const saved = addComplaint({
      category: complaintData.category,
      description: complaintData.description,
      severity: complaintData.severity,
      priority_score: complaintData.priority_score,
      priority_reason: complaintData.priority_reason,
      location: complaintData.location,
      image: complaintData.image,
      status: complaintData.status,
    });

    setSavedComplaintId(saved.id);
    setStage("submitted");
  } catch (err) {
    console.error("Complaint submission failed:", err);
    setError("Could not submit the complaint. Please try again.");
  }
};

  const stepIndex =
    stage === "submitted" ? 3 : stage === "location" ? 2 : stage === "result" || stage === "analyzing" ? 1 : 0;

  return (
    <section className="container-civic py-14">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-civic-700">
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
          Back to home
        </Link>

        <h1 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
          Report a Civic Issue
        </h1>
        <p className="mt-2 text-ink-500">Upload a photo and Civic-Eye's AI will do the rest.</p>

        <div className="mt-10">
          <StepIndicator current={stepIndex} />
        </div>

        {(stage === "upload" || stage === "analyzing") && (
          <div className="space-y-6">
            <ImageUploader image={image} onImageSelected={handleImageSelected} onClear={handleClearImage} />

            {error && <p className="text-sm font-medium text-alert-600">{error}</p>}

            {image && (
              <div className="flex justify-end">
                <Button
                  variant="signal"
                  size="lg"
                  icon={stage === "analyzing" ? Loader2 : Sparkles}
                  onClick={handleAnalyze}
                  disabled={stage === "analyzing"}
                  className={stage === "analyzing" ? "[&>svg]:animate-spin" : ""}
                >
                  {stage === "analyzing" ? "Analyzing image..." : "Analyze Issue"}
                </Button>
              </div>
            )}
          </div>
        )}

        {stage === "result" && result && (
          <div className="space-y-6">
            {image && (
              <img
                src={image.url}
                alt="Submitted civic issue"
                className="max-h-64 w-full rounded-xl2 border border-ink-100 object-cover shadow-card"
              />
            )}

            <AIResultCard
              result={{
                issue: result.category,
                severity: result.severity,
                priority: result.priority_score,
                description: result.description,
                reason: result.reason,
              }}
            />

            <div className="rounded-xl2 border border-ink-100 bg-white p-6 text-center shadow-card">
              <p className="font-display text-base font-semibold text-ink-900">Is this correct?</p>
              <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                <Button variant="signal" icon={Check} onClick={() => setStage("location")}>
                  Yes
                </Button>
                <Button variant="outline" icon={RotateCcw} onClick={handleChange}>
                  Change
                </Button>
              </div>
            </div>
          </div>
        )}

        {stage === "location" && <LocationPicker onConfirm={handleLocationConfirmed} />}

        {stage === "submitted" && (
          <div className="rounded-xl2 border border-ink-100 bg-white p-8 text-center shadow-card sm:p-12">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-signal-50 text-signal-600">
              <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
            </span>
            <h2 className="mt-5 font-display text-xl font-semibold text-ink-900">Complaint submitted</h2>
            {savedComplaintId && (
              <p className="mt-1 font-display text-sm font-semibold text-civic-700">{savedComplaintId}</p>
            )}
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
              Thanks for reporting this issue near {confirmedLocation?.address || "the selected location"}.
              It now appears on your Citizen Dashboard and in the Authority Dashboard's priority
              queue. This is still a frontend prototype, so nothing is sent to a real city system yet.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="ghost" icon={RotateCcw} onClick={handleChange}>
                Report another issue
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
