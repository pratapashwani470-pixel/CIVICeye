import { Sparkles, TriangleAlert, Flame } from "lucide-react";

const SEVERITY_STYLES = {
  Low: "bg-signal-50 text-signal-700",
  Medium: "bg-alert-100 text-alert-600",
  High: "bg-alert-100 text-alert-600",
  Critical: "bg-alert-500 text-white",
};

/**
 * Displays Gemini's structured AI analysis result.
 * result: { issue, description, severity, priority, reason }
 */
export default function AIResultCard({ result }) {
  const severityClass = SEVERITY_STYLES[result.severity] ?? SEVERITY_STYLES.Medium;

  return (
    <div className="rounded-xl2 border border-ink-100 bg-white p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-civic-600 text-white">
          <Sparkles className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <h3 className="font-display text-lg font-semibold text-ink-900">AI Analysis</h3>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-ink-100 bg-paper p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-ink-300">Detected issue</dt>
          <dd className="mt-1 font-display text-xl font-semibold text-ink-900">{result.issue}</dd>
        </div>

        <div className="rounded-xl border border-ink-100 bg-paper p-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-300">
            <TriangleAlert className="h-3.5 w-3.5" strokeWidth={2} />
            Severity
          </dt>
          <dd className="mt-1">
            <span className={`inline-flex rounded-full px-3 py-1 font-display text-sm font-semibold ${severityClass}`}>
              {result.severity}
            </span>
          </dd>
        </div>

        <div className="rounded-xl border border-ink-100 bg-paper p-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-300">
            <Flame className="h-3.5 w-3.5" strokeWidth={2} />
            Priority score
          </dt>
          <dd className="mt-1 font-display text-xl font-semibold text-ink-900">{result.priority} / 100</dd>
        </div>
      </dl>

      {result.description && (
        <p className="mt-5 border-t border-ink-100 pt-5 text-sm leading-relaxed text-ink-500">
          {result.description}
        </p>
      )}

      {result.reason && (
        <p className="mt-2 text-sm leading-relaxed text-ink-300">{result.reason}</p>
      )}
    </div>
  );
}
