import { MapPin, Flame, CalendarDays } from "lucide-react";

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
 * One row in the citizen's Recent Reports list.
 * report: { id, category, description, location, severity, priority, status, date }
 */
export default function ReportCard({ report }) {
  return (
    <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-sm font-semibold text-ink-500">{report.id}</span>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            STATUS_STYLES[report.status] ?? "bg-ink-100 text-ink-500"
          }`}
        >
          {report.status}
        </span>
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold text-ink-900">{report.category}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-500">{report.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-100 pt-4 text-sm text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4" strokeWidth={2} />
          {report.location}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <Flame className="h-4 w-4" strokeWidth={2} />
          Priority {report.priority}/100
        </span>

        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            SEVERITY_STYLES[report.severity] ?? "bg-ink-100 text-ink-500"
          }`}
        >
          {report.severity}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" strokeWidth={2} />
          {formatDate(report.date)}
        </span>
      </div>
    </div>
  );
}
