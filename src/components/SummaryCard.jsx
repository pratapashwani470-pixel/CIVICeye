const ACCENTS = {
  civic: "bg-civic-50 text-civic-600",
  signal: "bg-signal-50 text-signal-600",
  alert: "bg-alert-100 text-alert-600",
};

/**
 * Small stat card used at the top of the Citizen Dashboard.
 */
export default function SummaryCard({ icon: Icon, label, value, accent = "civic" }) {
  return (
    <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-card">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${ACCENTS[accent] ?? ACCENTS.civic}`}>
        <Icon className="h-5 w-5" strokeWidth={2.1} />
      </span>
      <p className="mt-4 font-display text-3xl font-semibold text-ink-900">{value}</p>
      <p className="mt-1 text-sm text-ink-500">{label}</p>
    </div>
  );
}
