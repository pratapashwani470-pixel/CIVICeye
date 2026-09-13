import { Link } from "react-router-dom";
import {
  Camera,
  Map,
  Sparkles,
  MapPin,
  Flame,
  Landmark,
  Construction,
  Trash2,
  LightbulbOff,
  Droplets,
  TrafficCone,
} from "lucide-react";
import Button from "../components/Button.jsx";
import ProcessStep from "../components/ProcessStep.jsx";
import IssueCard from "../components/IssueCard.jsx";

const PIPELINE = [
  { icon: Camera, title: "Capture", description: "Snap a photo of the problem on your street." },
  { icon: Sparkles, title: "AI Detects", description: "Civic-Eye identifies the issue type instantly." },
  { icon: MapPin, title: "Locate", description: "The report is pinned to its exact location." },
  { icon: Flame, title: "Prioritize", description: "Severity and urgency are scored automatically." },
  { icon: Landmark, title: "Resolve", description: "Authorities act on the highest-priority reports." },
];

const CATEGORIES = [
  { icon: Construction, label: "Pothole", description: "Cracked or sunken road surfaces." },
  { icon: Trash2, label: "Garbage / Waste", description: "Overflowing bins or illegal dumping." },
  { icon: LightbulbOff, label: "Broken Streetlight", description: "Dark, flickering, or damaged lights." },
  { icon: Droplets, label: "Water Leakage", description: "Burst pipes or standing water." },
  { icon: TrafficCone, label: "Damaged Road / Infrastructure", description: "Broken signage, rails, or pavement." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="container-civic pb-20 pt-16 sm:pt-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-white px-3.5 py-1.5 text-sm font-medium text-civic-700">
            <Sparkles className="h-3.5 w-3.5 text-signal-500" strokeWidth={2.2} />
            AI-powered civic reporting
          </span>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Report a problem.
            <br />
            Help improve your city.
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-500">
            Civic-Eye turns a single photo into a located, prioritized report — so citizens are heard
            and city teams know exactly what to fix first.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/report" variant="signal" size="lg" icon={Camera}>
              Report Issue
            </Button>
            <Button variant="outline" size="lg" icon={Map}>
              Explore Issues
            </Button>
          </div>
        </div>
      </section>

      {/* Explainer */}
      <section className="border-y border-ink-100 bg-white">
        <div className="container-civic grid grid-cols-1 gap-10 py-16 lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
              One report. Two audiences.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-3">
            <div>
              <h3 className="font-display text-base font-semibold text-ink-900">For citizens</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">
                Report a pothole, a leak, or a broken light in seconds — just a photo, no forms to fill in.
              </p>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-ink-900">For authorities</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">
                Every report arrives pre-classified and scored, so the most urgent problems surface first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container-civic py-20">
        <div className="mb-12 max-w-xl">
          <h2 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
            How Civic-Eye works
          </h2>
          <p className="mt-3 text-ink-500">
            From a photo on your phone to a resolved issue in your neighborhood.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0">
          {PIPELINE.map((step, i) => (
            <ProcessStep
              key={step.title}
              index={i + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
              last={i === PIPELINE.length - 1}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="border-t border-ink-100 bg-white">
        <div className="container-civic py-20">
          <div className="mb-12 max-w-xl">
            <h2 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
              What you can report
            </h2>
            <p className="mt-3 text-ink-500">Civic-Eye currently recognizes five common issue types.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((cat) => (
              <IssueCard key={cat.label} icon={cat.icon} label={cat.label} description={cat.description} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
