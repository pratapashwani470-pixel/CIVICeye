import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, Camera } from "lucide-react";
import Button from "./Button.jsx";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper/90 backdrop-blur">
      <div className="container-civic flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-civic-600 text-white">
            <Eye className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink-900">
            Civic-Eye
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">

        <button
  type="button"
  onClick={() => {
    navigate("/");
    setTimeout(() => {
      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }}
  className="text-sm font-medium text-ink-700 hover:text-civic-700"
>
  How it works
</button>
          <button
  type="button"
  onClick={() => {
    navigate("/");
    setTimeout(() => {
      document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }}
  className="text-sm font-medium text-ink-700 hover:text-civic-700"
>
  Issue types
</button>
          <Link
            to="/dashboard"
            className={`text-sm font-medium hover:text-civic-700 ${
              pathname === "/dashboard" ? "text-civic-700" : "text-ink-700"
            }`}
          >
            Citizen Dashboard
          </Link>
          <Link
            to="/authority"
            className={`text-sm font-medium hover:text-civic-700 ${
              pathname === "/authority" ? "text-civic-700" : "text-ink-700"
            }`}
          >
            Authority Dashboard
          </Link>
        </nav>

        {pathname !== "/report" && (
          <Button as={Link} to="/report" variant="primary" size="sm" icon={Camera}>
            Report Issue
          </Button>
        )}
      </div>
    </header>
  );
}
