import { Suspense, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../lib/auth";
import { AdminPageShell } from "./LoadingShell";
import type { SiteStats } from "../types";

const SITE_STATS_CACHE_KEY = "mathatlas-admin-site-stats";

function readCachedSiteStats() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(SITE_STATS_CACHE_KEY);
    return rawValue ? (JSON.parse(rawValue) as SiteStats) : null;
  } catch {
    return null;
  }
}

function storeCachedSiteStats(value: SiteStats) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(SITE_STATS_CACHE_KEY, JSON.stringify(value));
}

const navigation = [
  { label: "Dashboard", to: "/admin" },
  { label: "Content Studio", to: "/admin/content" },
];

export function AdminShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [siteStats, setSiteStats] = useState<SiteStats | null>(() => readCachedSiteStats());

  useEffect(() => {
    let isCancelled = false;

    async function loadSiteStats() {
      try {
        const payload = await apiRequest<SiteStats>("/meta/site-stats");
        if (isCancelled) {
          return;
        }

        setSiteStats(payload);
        storeCachedSiteStats(payload);
      } catch {
        if (isCancelled) {
          return;
        }

        setSiteStats((current) => current ?? null);
      }
    }

    void loadSiteStats();

    return () => {
      isCancelled = true;
    };
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand-card">
          <div className="eyebrow">Private Workspace</div>
          <h1>MathAtlas</h1>
          <p>Admins and authors manage questions, concepts, solutions, and counterexamples here.</p>
        </div>

        <nav className="admin-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) => (isActive ? "admin-nav-link active" : "admin-nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
            <small>{user?.email}</small>
          </div>

          <Link className="ghost-button full-width" to="/">
            Open Public Home
          </Link>
          <button className="text-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <div className="eyebrow">{user?.role === "ADMIN" ? "Admin Area" : "Author Area"}</div>
            <h2>{user?.role === "ADMIN" ? "Administration Dashboard" : "Author Dashboard"}</h2>
            <p>Full-width private workspace for managing MathAtlas content.</p>
          </div>

          <div className="admin-topbar-actions">
            <Link className="ghost-button" to="/questions">
              Browse Public Questions
            </Link>
            <Link className="primary-button" to="/admin/content">
              Manage Content
            </Link>
          </div>
        </header>

        <main className="admin-main-content">
          <Suspense fallback={<AdminPageShell />}>
            <Outlet />
          </Suspense>
        </main>

        <footer className="admin-footer">
          <span>
            Public visitor views:{" "}
            {siteStats ? siteStats.visitorViewCount : <span className="admin-footer-shell" aria-hidden="true" />}
          </span>
          <span>
            Logged in as {user?.name} ({user?.role})
          </span>
        </footer>
      </div>
    </div>
  );
}
