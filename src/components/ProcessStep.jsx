import { ArrowDown, ArrowRight } from "lucide-react";

/**
 * One step in the Civic-Eye pipeline. Renders a connecting arrow after
 * itself unless `last` is true — vertical on mobile, horizontal on desktop.
 */
export default function ProcessStep({ icon: Icon, title, description, index, last = false }) {
  return (
    <div className="flex flex-1 flex-row items-center gap-4 md:flex-col md:items-stretch md:gap-0">
      <div className="flex flex-1 flex-col items-start rounded-xl2 border border-ink-100 bg-white p-5 shadow-card md:items-center md:p-6 md:text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-civic-600 text-sm font-display font-semibold text-white">
          {index}
        </span>
        <span className="mt-3 flex h-10 w-10 items-center justify-center rounded-lg bg-signal-50 text-signal-600 md:mt-4">
          <Icon className="h-5 w-5" strokeWidth={2.1} />
        </span>
        <h3 className="mt-3 font-display text-[0.95rem] font-semibold text-ink-900">{title}</h3>
        <p className="mt-1 text-sm leading-snug text-ink-500">{description}</p>
      </div>

      {!last && (
        <>
          <ArrowDown className="h-5 w-5 shrink-0 text-ink-300 md:hidden" strokeWidth={2} />
          <ArrowRight className="mx-2 hidden h-5 w-5 shrink-0 text-ink-300 md:block" strokeWidth={2} />
        </>
      )}
    </div>
  );
}
