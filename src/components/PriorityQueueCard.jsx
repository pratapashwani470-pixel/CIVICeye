import { MapPin, Flame, CalendarDays, ChevronRight, Copy } from "lucide-react";
import { STATUSES } from "../utils/complaintsStore.js";

const STATUS_STYLES = {
  Submitted: "bg-civic-50 text-civic-700",
  "In Progress": "bg-alert-100 text-alert-600",
  Resolved: "bg-signal-50 text-signal-700",
};

const SEVERITY_STYLES = {
  Low: "bg-signal-50 text-signal-700",
  Medium: "bg-alert-100 text-alert-600",
  High: "bg-alert-100 text-alert-600",
  Critical: "bg-alert-500 text-white",
};

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * One row in the Authority Dashboard's Priority Queue.
 * complaint: full record from complaintsStore.js, optionally enriched with
 * `relatedIds` (possible-duplicate complaint ids) and `effectivePriority`
 * (priority_score after a small related-reports bonus) from
 * duplicateDetection.js.
 */
export default function PriorityQueueCard({ complaint, onSelect, onStatusChange }) {
  const relatedIds = complaint.relatedIds || [];
  const displayPriority = complaint.effectivePriority ?? complaint.priority_score;

  return (
    <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-card transition-colors hover:border-civic-300 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelect(complaint)}
          className="flex items-center gap-1.5 font-display text-sm font-semibold text-ink-500 hover:text-civic-700"
        >
          {complaint.id}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>

        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            SEVERITY_STYLES[complaint.severity] ?? "bg-ink-100 text-ink-500"
          }`}
        >
          {complaint.severity}
        </span>
      </div>

      <button type="button" onClick={() => onSelect(complaint)} className="block text-left">
        <h3 className="mt-3 font-display text-lg font-semibold text-ink-900">{complaint.category}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">{complaint.description}</p>
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-100 pt-4 text-sm text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4" strokeWidth={2} />
          {complaint.location?.address || "Location unavailable"}
        </span>

        <span className="inline-flex items-center gap-1.5 font-semibold text-ink-700">
          <Flame className="h-4 w-4" strokeWidth={2} />
          Priority {displayPriority}/100
        </span>

        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" strokeWidth={2} />
          {formatDate(complaint.date)}
        </span>
      </div>

      {relatedIds.length > 0 && (
        <button
          type="button"
          onClick={() => onSelect(complaint)}
          className="mt-3 flex w-full items-start gap-1.5 rounded-lg bg-civic-50 px-3 py-2 text-left text-xs text-civic-700"
        >
          <Copy className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>
            <span className="font-semibold">
              Possible duplicate reports — {relatedIds.length} related report{relatedIds.length === 1 ? "" : "s"}
            </span>
            <span className="block text-civic-700/80">Related: {relatedIds.join(", ")}</span>
          </span>
        </button>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            STATUS_STYLES[complaint.status] ?? "bg-ink-100 text-ink-500"
          }`}
        >
          {complaint.status}
        </span>

        <label className="flex items-center gap-2 text-sm text-ink-500">
          Update status
          <select
            value={complaint.status}
            onChange={(e) => onStatusChange(complaint.id, e.target.value)}
            className="rounded-lg border border-ink-100 bg-white px-2.5 py-1.5 text-sm font-medium text-ink-700 focus-visible:ring-2 focus-visible:ring-civic-300"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
