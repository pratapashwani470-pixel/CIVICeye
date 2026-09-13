import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Flame, ShieldAlert, Clock, CheckCircle2, Info } from "lucide-react";
import SummaryCard from "../components/SummaryCard.jsx";
import PriorityQueueCard from "../components/PriorityQueueCard.jsx";
import ComplaintDetailsModal from "../components/ComplaintDetailsModal.jsx";
import {
  getComplaints,
  updateComplaintStatus,
  COMPLAINTS_UPDATED_EVENT,
  SEVERITIES,
  STATUSES,
} from "../utils/complaintsStore.js";
import { buildRelatedReportsMap, adjustPriorityForRelatedReports } from "../utils/duplicateDetection.js";

const SEVERITY_FILTERS = ["All", ...SEVERITIES];
const STATUS_FILTERS = ["All", ...STATUSES];

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-300">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              value === option
                ? "bg-civic-600 text-white"
                : "border border-ink-100 bg-white text-ink-700 hover:border-civic-300"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AuthorityDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
  const load = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/complaints");

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();

      const formattedComplaints = data.map((complaint) => ({
        id: complaint.complaint_id,
        category: complaint.category,
        description: complaint.description,
        severity: complaint.severity,
        priority_score: complaint.priority_score,
        priority_reason: complaint.priority_reason,
        location: complaint.location || {
          address: complaint.address || "Location unavailable",
        },
        status: complaint.status,
        date: complaint.created_at,
        image: complaint.image,
      }));

      setComplaints(formattedComplaints);
    } catch (error) {
      console.error("Failed to load complaints:", error);
      setComplaints([]);
    }
  };

  load();

  window.addEventListener(COMPLAINTS_UPDATED_EVENT, load);

  return () => {
    window.removeEventListener(COMPLAINTS_UPDATED_EVENT, load);
  };
}, []);

  const handleStatusChange = async (id, status) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/complaints/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update complaint status");
    }

    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === id ? { ...complaint, status } : complaint
      )
    );

    setSelected((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev
    );

    window.dispatchEvent(new Event(COMPLAINTS_UPDATED_EVENT));
  } catch (error) {
    console.error("Status update failed:", error);
    alert("Could not update complaint status. Please try again.");
  }
};

  // Derived, read-only: which complaints look like possible duplicates of
  // each other (same category + close coordinates), and an effective
  // priority score that gives repeated reports a small, capped boost. The
  // original AI priority_score on each complaint is never overwritten.
  const relatedMap = useMemo(() => buildRelatedReportsMap(complaints), [complaints]);

  const enriched = useMemo(() => {
    return complaints.map((c) => {
      const relatedIds = relatedMap[c.id] || [];
      return {
        ...c,
        relatedIds,
        effectivePriority: adjustPriorityForRelatedReports(c.priority_score, relatedIds.length),
      };
    });
  }, [complaints, relatedMap]);

  const filtered = useMemo(() => {
    return enriched
      .filter((c) => severityFilter === "All" || c.severity === severityFilter)
      .filter((c) => statusFilter === "All" || c.status === statusFilter)
      .sort((a, b) => b.effectivePriority - a.effectivePriority);
  }, [enriched, severityFilter, statusFilter]);

  const total = complaints.length;
  const critical = complaints.filter((c) => c.severity === "Critical").length;
  const highPriority = complaints.filter((c) => c.severity === "High").length;
  const pending = complaints.filter((c) => c.status !== "Resolved").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;

  const selectedEnriched = selected ? enriched.find((c) => c.id === selected.id) ?? selected : null;

  return (
    <section className="container-civic py-14">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
          Authority Dashboard
        </h1>
        <p className="mt-2 max-w-xl text-ink-500">
          Monitor, prioritize and manage reported civic issues.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <SummaryCard icon={ClipboardList} label="Total Complaints" value={total} accent="civic" />
        <SummaryCard icon={ShieldAlert} label="Critical" value={critical} accent="alert" />
        <SummaryCard icon={Flame} label="High Priority" value={highPriority} accent="alert" />
        <SummaryCard icon={Clock} label="Pending" value={pending} accent="civic" />
        <SummaryCard icon={CheckCircle2} label="Resolved" value={resolved} accent="signal" />
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-xl2 border border-ink-100 bg-white p-4 shadow-card">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-civic-600" strokeWidth={2} />
        <p className="text-sm leading-relaxed text-ink-500">
          Priority Score is calculated from issue severity, public impact, location risk and duplicate
          reports.{" "}
          <span className="text-ink-300">
            Duplicate matching in this prototype is a simple check — same issue category and reports
            within 100m of each other — not a verified AI duplicate-detection system.
          </span>
        </p>
      </div>

      <div className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-ink-900">Priority Queue</h2>
          <p className="text-sm text-ink-300">Sorted by priority score, highest first</p>
        </div>

        <div className="mt-5 flex flex-col gap-5 rounded-xl2 border border-ink-100 bg-paper p-5 sm:flex-row sm:items-start sm:justify-between">
          <FilterGroup label="Severity" options={SEVERITY_FILTERS} value={severityFilter} onChange={setSeverityFilter} />
          <FilterGroup label="Status" options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <div className="mt-6 space-y-4">
          {filtered.length === 0 && (
            <p className="rounded-xl2 border border-ink-100 bg-white p-8 text-center text-sm text-ink-500 shadow-card">
              No complaints match the selected filters.
            </p>
          )}

          {filtered.map((complaint) => (
            <PriorityQueueCard
              key={complaint.id}
              complaint={complaint}
              onSelect={setSelected}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>

      <ComplaintDetailsModal
        complaint={selectedEnriched}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    </section>
  );
}
