import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Send, Clock, CheckCircle2, Camera } from "lucide-react";
import Button from "../components/Button.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import ReportCard from "../components/ReportCard.jsx";
import { COMPLAINTS_UPDATED_EVENT } from "../utils/complaintsStore.js";

// Maps a stored complaint into the shape ReportCard already expects.
function toReport(complaint) {
  return {
    id: complaint.id,
    category: complaint.category,
    description: complaint.description,
    location: complaint.location?.address || "Location unavailable",
    severity: complaint.severity,
    priority: complaint.priority_score,
    status: complaint.status,
    date: complaint.date,
  };
}

export default function Dashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
  const load = async () => {
    try {
      const response = await fetch("/api/complaints");

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();

      const mappedReports = data.map((complaint) => ({
        id: complaint.complaint_id,
        category: complaint.category,
        description: complaint.description,
        location:
          complaint.location?.address ||
          complaint.address ||
          "Location unavailable",
        severity: complaint.severity,
        priority: complaint.priority_score,
        status: complaint.status,
        date: complaint.created_at,
      }));

      setReports(mappedReports);
    } catch (error) {
      console.error("Failed to load complaints:", error);
      setReports([]);
    }
  };

  load();

  window.addEventListener(COMPLAINTS_UPDATED_EVENT, load);

  return () => {
    window.removeEventListener(COMPLAINTS_UPDATED_EVENT, load);
  };
}, []);

  const total = reports.length;
  const submitted = reports.filter((r) => r.status === "Submitted").length;
  const inProgress = reports.filter((r) => r.status === "In Progress").length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;

  return (
    <section className="container-civic py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
            Citizen Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-ink-500">
            Track the civic issues you've reported and see how they're progressing.
          </p>
        </div>

        <Button as={Link} to="/report" variant="signal" size="lg" icon={Camera} className="shrink-0">
          Report New Issue
        </Button>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard icon={ClipboardList} label="Total Reports" value={total} accent="civic" />
        <SummaryCard icon={Send} label="Submitted" value={submitted} accent="civic" />
        <SummaryCard icon={Clock} label="In Progress" value={inProgress} accent="alert" />
        <SummaryCard icon={CheckCircle2} label="Resolved" value={resolved} accent="signal" />
      </div>

      <div className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-ink-900">Recent Reports</h2>
          <p className="text-sm text-ink-300">
            {total ? "Sorted by most recently reported" : "Sample data for this prototype"}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </div>
    </section>
  );
}
