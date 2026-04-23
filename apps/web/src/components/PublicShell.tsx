import { FormEvent, Suspense, lazy, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { HomeSectionShell } from "./LoadingShell";

const AuthModal = lazy(() =>
  import("./AuthModal").then((module) => ({ default: module.AuthModal })),
);

const navigation = [
  { label: "Home", to: "/" },
  { label: "Defination/Theorem", to: "/concepts" },
  { label: "Counterexamples", to: "/counterexamples" },
];

export function PublicShell() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("mathatlas-public-theme") === "dark";
  });
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("mathatlas-public-theme", isDarkMode ? "dark" : "light");
    document.body.classList.toggle("public-theme-dark", isDarkMode);
    document.body.classList.toggle("public-theme-light", !isDarkMode);

    return () => {
      document.body.classList.remove("public-theme-dark");
      document.body.classList.remove("public-theme-light");
    };
  }, [isDarkMode]);

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
    <div className={isDarkMode ? "public-shell public-shell-dark" : "public-shell public-shell-light"}>
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
            <button
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDarkMode}
              className={isDarkMode ? "public-mode-toggle is-dark" : "public-mode-toggle"}
              onClick={() => setIsDarkMode((current) => !current)}
              type="button"
            >
              <span className="public-mode-toggle-thumb">
                {isDarkMode ? (
                  <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 15.5A8.5 8.5 0 1 1 8.5 4a6.5 6.5 0 0 0 11.5 11.5Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                ) : (
                  <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.8" />
                    <path
                      d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.72 5.28l-1.56 1.56M6.84 17.16l-1.56 1.56M18.72 18.72l-1.56-1.56M6.84 6.84 5.28 5.28"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </span>
            </button>
            <button className="public-login-button" onClick={() => updateAuthQuery("login")} type="button">
              Login
            </button>
            <form className="public-search-form" onSubmit={handleSubmit}>
              <button className="public-search-icon" type="submit" aria-label="Search">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M11 4.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13Zm0 0 0 0Zm4.9 11.4 4.1 4.1"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.9"
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
