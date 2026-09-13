export default function IssueCard({ icon: Icon, label, description }) {
  return (
    <div className="group rounded-xl2 border border-ink-100 bg-white p-5 shadow-card transition-colors hover:border-signal-300">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-civic-50 text-civic-600 transition-colors group-hover:bg-signal-50 group-hover:text-signal-600">
        <Icon className="h-5 w-5" strokeWidth={2.1} />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold text-ink-900">{label}</h3>
      {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
    </div>
  );
}
