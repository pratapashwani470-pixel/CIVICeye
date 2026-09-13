import { Eye } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="container-civic flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-civic-600 text-white">
            <Eye className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className="font-display text-base font-semibold text-ink-900">Civic-Eye</span>
        </div>
        <p className="text-sm text-ink-500">
          Built for citizens and city teams. AI-powered civic issue reporting and management platform.
        </p>
      </div>
    </footer>
  );
}
