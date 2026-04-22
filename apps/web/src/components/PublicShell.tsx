import { FormEvent, Suspense, lazy, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { HomeSectionShell } from "./LoadingShell";

const AuthModal = lazy(() =>
  import("./AuthModal").then((module) => ({ default: module.AuthModal })),
);

const navigation = [
  { label: "Home", to: "/" },
  { label: "Questions", to: "/questions" },
  { label: "Subjects", to: "/subjects" },
  { label: "Years", to: "/years" },
  { label: "Concepts", to: "/concepts" },
  { label: "Counterexamples", to: "/counterexamples" },
  { label: "Search", to: "/search" },
];

export function PublicShell() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const authMode = searchParams.get("auth");
  const next = searchParams.get("next");

  useEffect(() => {
    const sessionKey = "mathatlas-visitor-view-recorded";
    const timer = window.setTimeout(() => {
      void recordVisitorView();
    }, 1800);

    async function recordVisitorView() {
      if (sessionStorage.getItem(sessionKey)) {
        return;
      }

      try {
        await apiRequest("/meta/visitor-view", { method: "POST" });
        sessionStorage.setItem(sessionKey, "1");
      } catch {
        // Ignore tracking failures; the public site should remain usable.
      }
    }

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function updateAuthQuery(mode: "login" | "create" | null) {
    const nextParams = new URLSearchParams(searchParams);

    if (mode) {
      nextParams.set("auth", mode);
    } else {
      nextParams.delete("auth");
      nextParams.delete("next");
    }

    setSearchParams(nextParams, { replace: true });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();

    navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  return (
    <div className="public-shell">
      <header className="public-header">
        <div className="public-header-row">
          <div className="public-brand-block">
            <NavLink className="public-brand-link" to="/">
              <img className="public-brand-logo" src="/mathatlas-logo.png" alt="MathAtlas logo" />
              <div className="public-brand-copy">
                <span className="public-brand-title">MathAtlas</span>
              </div>
            </NavLink>
          </div>

          <div className="public-tools">
            <form className="public-search-form" onSubmit={handleSubmit}>
              <button className="public-search-icon" type="submit" aria-label="Search">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M10.5 4.5a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm0-1.5a7.5 7.5 0 1 1 4.72 13.33l4.72 4.72a.75.75 0 1 1-1.06 1.06l-4.72-4.72A7.5 7.5 0 0 1 10.5 3Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search"
                aria-label="Search MathAtlas"
              />
            </form>
          </div>
        </div>

        <nav className="public-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => (isActive ? "public-nav-link active" : "public-nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="public-main">
        <Suspense fallback={<HomeSectionShell />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="public-footer">
        <div className="public-footer-bottom">
          <span>Copyright {"\u00A9"} {new Date().getFullYear()} MathAtlas. All rights reserved.</span>
        </div>
      </footer>

      {authMode === "login" || authMode === "create" ? (
        <Suspense fallback={null}>
          <AuthModal
            mode={authMode}
            next={next}
            onClose={() => updateAuthQuery(null)}
            onModeChange={(mode) => updateAuthQuery(mode)}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
