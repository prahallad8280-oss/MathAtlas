import { FormEvent, Suspense, lazy, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";

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
            <Link className="public-brand-link" to="/">
              <img className="public-brand-logo" src="/mathatlas-logo.png" alt="MathAtlas logo" />
              <div className="public-brand-copy">
                <span className="public-brand-title">MathAtlas</span>
                <span className="public-brand-tagline">Mathematical Blog and CSIR NET Question Bank</span>
              </div>
            </Link>
            <p>Open mathematical notes, CSIR NET questions, linked theorems, and counterexamples for everyone.</p>
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
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="public-footer-top">
          <div className="public-footer-brand">
            <img className="public-footer-logo" src="/mathatlas-logo.png" alt="MathAtlas logo" />
            <div className="public-footer-copy">
              <strong>MathAtlas</strong>
              <p>Public mathematical knowledge, linked theory, and CSIR NET preparation in one open platform.</p>
            </div>
          </div>

          <div className="public-footer-links">
            <div className="public-footer-column">
              <div className="section-label">Explore</div>
              <div className="footer-link-list">
                <Link to="/">Home</Link>
                <Link to="/questions">Questions</Link>
                <Link to="/concepts">Concepts</Link>
                <Link to="/counterexamples">Counterexamples</Link>
              </div>
            </div>

            <div className="public-footer-column">
              <div className="section-label">Access</div>
              <div className="footer-link-list">
                <Link to="/search">Search</Link>
                <Link to="/subjects">Subjects</Link>
                <Link to="/years">Years</Link>
                <Link to="/admin/login">Admin / Author Login</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="public-footer-bottom">
          <span>MathAtlas Knowledge Platform</span>
          <span>Built for mathematical writing, theory links, and CSIR NET question practice.</span>
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
