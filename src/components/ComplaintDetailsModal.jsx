import { X, ImageOff, MapPin, Flame, CalendarClock, Sparkles, FileText, Copy } from "lucide-react";
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

// Labels the action buttons show to move a complaint to another status.
// The current status is always excluded from its own button list.
const STATUS_ACTION_LABEL = {
  Submitted: "Mark Submitted",
  "In Progress": "Mark In Progress",
  Resolved: "Mark Resolved",
};

function formatDateTime(isoValue) {
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";
  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Complaint Details / Evidence view — a case-file style panel the authority
 * opens from the Priority Queue. Shows everything needed to evaluate and
 * act on one complaint: the citizen's photo, the AI analysis, location, and
 * status controls.
 *
 * complaint: full record from complaintsStore.js, optionally enriched with
 * `relatedIds` (possible-duplicate complaint ids) and `effectivePriority`
 * from duplicateDetection.js, or null to render nothing.
 */
export default function ComplaintDetailsModal({ complaint, onClose, onStatusChange }) {
  if (!complaint) return null;

  const otherStatuses = STATUSES.filter((status) => status !== complaint.status);
  const relatedIds = complaint.relatedIds || [];
  const displayPriority = complaint.effectivePriority ?? complaint.priority_score;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Complaint details for ${complaint.id}`}
    >
      <div
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-xl2 border border-ink-100 bg-white shadow-lift sm:rounded-xl2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Case-file header — deliberately reads as an official record, not a generic popup */}
        <div className="flex items-start justify-between gap-4 rounded-t-xl2 bg-civic-800 px-6 py-5 sm:px-8">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-civic-200">
              <FileText className="h-3.5 w-3.5" strokeWidth={2} />
              Complaint Record
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-white">Complaint {complaint.id}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-civic-100 hover:bg-white/10"
          >
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* Evidence — the citizen's original uploaded photo */}
          {complaint.image ? (
            <img
              src={complaint.image}
              alt={`Reported ${complaint.category.toLowerCase()} issue`}
              className="max-h-72 w-full rounded-xl2 border border-ink-100 object-cover"
            />
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl2 border border-dashed border-ink-100 bg-paper text-ink-300">
              <ImageOff className="h-6 w-6" strokeWidth={1.8} />
              <p className="text-sm font-medium">No image available</p>
            </div>
          )}

          {/* Quick facts */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-civic-50 px-3 py-1 font-display text-sm font-semibold text-civic-700">
              {complaint.category}
            </span>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                SEVERITY_STYLES[complaint.severity] ?? "bg-ink-100 text-ink-500"
              }`}
            >
              {complaint.severity}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1 text-sm font-semibold text-ink-700">
              <Flame className="h-3.5 w-3.5" strokeWidth={2.2} />
              Priority {displayPriority}/100
              {relatedIds.length > 0 && complaint.priority_score !== displayPriority && (
                <span className="text-ink-300">(base {complaint.priority_score})</span>
              )}
            </span>
          </div>

          {/* AI Analysis */}
          <div className="mt-6 rounded-xl2 border border-ink-100 p-5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-civic-700">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
              AI Analysis
            </p>
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-300">Description</dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-ink-700">
                  {complaint.description || "No description provided."}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-300">Priority reason</dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-ink-700">
                  {complaint.priority_reason || "No reason recorded for this complaint."}
                </dd>
              </div>
            </dl>
          </div>

          {/* Possible duplicate / related reports — heuristic only */}
          {relatedIds.length > 0 && (
            <div className="mt-4 rounded-xl2 border border-civic-100 bg-civic-50 p-5">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-civic-700">
                <Copy className="h-3.5 w-3.5" strokeWidth={2.2} />
                Possible duplicate reports
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-civic-800">
                {relatedIds.length} related report{relatedIds.length === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-sm text-civic-700">Related reports: {relatedIds.join(", ")}</p>
              <p className="mt-2 text-xs text-civic-700/70">
                Based on matching issue category and reports within ~100m of each other — a prototype
                heuristic, not confirmed duplicates.
              </p>
            </div>
          )}

          {/* Location */}
          <div className="mt-4 rounded-xl2 border border-ink-100 p-5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-civic-700">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2.2} />
              Location
            </p>
            <p className="mt-1 text-sm font-medium text-ink-900">
              {complaint.location?.address || "Address unavailable"}
            </p>
          </div>

          {/* Report information */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl2 border border-ink-100 p-5">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-civic-700">
                <CalendarClock className="h-3.5 w-3.5" strokeWidth={2.2} />
                Reported
              </p>
              <p className="mt-1 text-sm font-medium text-ink-900">{formatDateTime(complaint.date)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-civic-700">Current status</p>
              <span
                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  STATUS_STYLES[complaint.status] ?? "bg-ink-100 text-ink-500"
                }`}
              >
                {complaint.status}
              </span>
            </div>
          </div>

          {/* Status actions */}
          <div className="mt-6 border-t border-ink-100 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">Status actions</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              {otherStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onStatusChange(complaint.id, status)}
                  className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    status === "Resolved"
                      ? "bg-signal-500 text-white hover:bg-signal-600"
                      : "border border-ink-100 bg-white text-civic-700 hover:border-civic-300"
                  }`}
                >
                  {STATUS_ACTION_LABEL[status]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
