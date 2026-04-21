import { FormEvent, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../lib/auth";
import { apiRequest } from "../lib/api";

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
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const authMode = searchParams.get("auth");
  const next = searchParams.get("next");

  useEffect(() => {
    const sessionKey = "mathatlas-visitor-view-recorded";

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

    void recordVisitorView();
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
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search questions, concepts, counterexamples..."
              />
              <button className="primary-button" type="submit">
                Search
              </button>
            </form>

            <div className="public-auth-row">
              {isAuthenticated && user ? (
                <>
                  <span className="public-status-pill">
                    Signed in as {user.name} ({user.role})
                  </span>
                  <Link className="ghost-button" to="/admin">
                    Open Admin
                  </Link>
                </>
              ) : (
                <button className="primary-button" onClick={() => updateAuthQuery("login")} type="button">
                  Admin / Author Login
                </button>
              )}
            </div>
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
        <AuthModal
          mode={authMode}
          next={next}
          onClose={() => updateAuthQuery(null)}
          onModeChange={(mode) => updateAuthQuery(mode)}
        />
      ) : null}
    </div>
  );
}
