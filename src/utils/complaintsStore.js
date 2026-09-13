// Shared complaint storage for the Civic-Eye prototype.
//
// This is intentionally just localStorage — there is no backend database
// yet. Both the Citizen Dashboard and the Authority Dashboard read/write
// through this one module so they always agree on the current state of
// each complaint (in particular: status changes made by the authority are
// immediately visible to the citizen view).
//
// Complaint shape:
// {
//   id: "CE-2026-0007",
//   category: "Water Leakage",
//   description: "Continuous water leakage near the main road.",
//   severity: "Low" | "Medium" | "High" | "Critical",
//   priority_score: 0-100,
//   priority_reason: string,
//   location: { latitude: number|null, longitude: number|null, address: string },
//   status: "Submitted" | "In Progress" | "Resolved",
//   date: "YYYY-MM-DD",
//   image: string|null, // data URL, only present if the citizen attached a photo
// }

const STORAGE_KEY = "civic-eye-complaints";
export const COMPLAINTS_UPDATED_EVENT = "civic-eye:complaints-updated";

export const STATUSES = ["Submitted", "In Progress", "Resolved"];
export const SEVERITIES = ["Low", "Medium", "High", "Critical"];

// Fallback sample data so neither dashboard is ever empty during a demo.
// This mirrors the sample data the Citizen Dashboard used to hardcode —
// it's shown only until a real complaint has been submitted.
export const SAMPLE_COMPLAINTS = [
  {
    id: "CE-2026-0001",
    category: "Pothole",
    description: "Large pothole near the main junction causing traffic slowdown.",
    severity: "High",
    priority_score: 92,
    priority_reason: "High-traffic junction location increases risk of accidents.",
    location: { latitude: 30.7046, longitude: 76.8172, address: "Ward 7 — Lakeside Colony" },
    status: "Submitted",
    date: "2026-09-02",
    image: null,
  },
  {
    id: "CE-2026-0002",
    category: "Garbage/Waste",
    description: "Overflowing garbage bin attracting stray animals.",
    severity: "Medium",
    priority_score: 68,
    priority_reason: "Moderate public health impact from waste accumulation.",
    location: { latitude: 30.7185, longitude: 76.8021, address: "Ward 3 — Market Road" },
    status: "In Progress",
    date: "2026-08-27",
    image: null,
  },
  {
    id: "CE-2026-0003",
    category: "Broken Streetlight",
    description: "Streetlight has been non-functional for over a week.",
    severity: "Medium",
    priority_score: 55,
    priority_reason: "Reduced night visibility on a residential street.",
    location: { latitude: 30.7302, longitude: 76.7889, address: "Ward 11 — Green Avenue" },
    status: "Resolved",
    date: "2026-08-19",
    image: null,
  },
  {
    id: "CE-2026-0004",
    category: "Water Leakage",
    description: "Continuous water leakage from an underground pipe.",
    severity: "Critical",
    priority_score: 97,
    priority_reason: "Continuous leakage near a main road risks water loss and road damage.",
    location: { latitude: 30.7046, longitude: 76.8172, address: "Ward 7 — Lakeside Colony" },
    status: "In Progress",
    date: "2026-09-05",
    image: null,
  },
  {
    id: "CE-2026-0005",
    category: "Damaged Road/Infrastructure",
    description: "Cracked pavement and a missing guard rail near the footbridge.",
    severity: "High",
    priority_score: 81,
    priority_reason: "Missing guard rail near a footbridge is a direct safety hazard.",
    location: { latitude: 30.7185, longitude: 76.8021, address: "Ward 3 — Market Road" },
    status: "Submitted",
    date: "2026-09-08",
    image: null,
  },
  {
    id: "CE-2026-0006",
    category: "Pothole",
    description: "Small pothole forming after recent rains.",
    severity: "Low",
    priority_score: 34,
    priority_reason: "Minor size and low-traffic street keep impact low for now.",
    location: { latitude: 30.7302, longitude: 76.7889, address: "Ward 11 — Green Avenue" },
    status: "Resolved",
    date: "2026-07-30",
    image: null,
  },
  {
    id: "CE-2026-0007",
    category: "Water Leakage",
    description: "Water pooling near the footpath from the same underground pipe.",
    severity: "High",
    priority_score: 88,
    priority_reason: "Same leak source as a nearby report is worsening surface pooling.",
    location: { latitude: 30.70465, longitude: 76.81725, address: "Ward 7 — Lakeside Colony" },
    status: "Submitted",
    date: "2026-09-09",
    image: null,
  },
  {
    id: "CE-2026-0008",
    category: "Water Leakage",
    description: "Third resident report of the same leak near Lakeside Colony.",
    severity: "High",
    priority_score: 85,
    priority_reason: "Multiple residents reporting the same underground leak.",
    location: { latitude: 30.70455, longitude: 76.81715, address: "Ward 7 — Lakeside Colony" },
    status: "Submitted",
    date: "2026-09-10",
    image: null,
  },
];

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeRaw(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Notify other components in this same tab (the native "storage" event
    // only fires in *other* tabs), so the Citizen and Authority dashboards
    // stay in sync even when both are mounted client-side in one session.
    window.dispatchEvent(new CustomEvent(COMPLAINTS_UPDATED_EVENT));
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns every complaint currently stored. Seeds localStorage with the
 * bundled sample data the first time this is called so the prototype is
 * never empty.
 */
export function getComplaints() {
  const existing = readRaw();
  if (existing) return existing;
  writeRaw(SAMPLE_COMPLAINTS);
  return SAMPLE_COMPLAINTS;
}

function nextId(list) {
  const year = new Date().getFullYear();
  const sequence = list.filter((c) => c.id?.startsWith(`CE-${year}-`)).length + 1;
  return `CE-${year}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Adds a newly-submitted complaint (from the Report flow) and returns it
 * with its generated id. Fields not supplied default to sensible values.
 */
export function addComplaint(complaint) {
  const list = getComplaints();
  const withId = {
    status: "Submitted",
    // Full timestamp (not just a date) so the Authority Dashboard's details
    // view can show a real reported time, not just a day.
    date: new Date().toISOString(),
    image: null,
    priority_reason: "",
    ...complaint,
    id: nextId(list),
  };
  const updated = [withId, ...list];
  writeRaw(updated);
  return withId;
}

/** Updates just the status of one complaint (used by the Authority Dashboard). */
export function updateComplaintStatus(id, status) {
  const list = getComplaints();
  const updated = list.map((c) => (c.id === id ? { ...c, status } : c));
  writeRaw(updated);
  return updated;
}
