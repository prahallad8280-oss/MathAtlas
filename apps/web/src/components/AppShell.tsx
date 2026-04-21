import { FormEvent, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const navigation = [
  { label: "Dashboard", to: "/" },
  { label: "Questions", to: "/questions" },
  { label: "Subjects", to: "/subjects" },
  { label: "Years", to: "/years" },
  { label: "Concepts", to: "/concepts" },
  { label: "Counterexamples", to: "/counterexamples" },
  { label: "Search", to: "/search" },
];

export function AppShell() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="eyebrow">Mathematical Blog + CSIR NET Platform</div>
          <h1>MathAtlas</h1>
          <p>Questions, concepts, counterexamples, linked knowledge, and authoring tools in one place.</p>
        </div>

        <nav className="nav-list">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {isAuthenticated && user ? (
            <>
              <div className="user-badge">
                <strong>{user.name}</strong>
                <span>{user.role}</span>
              </div>
              <button className="ghost-button full-width" onClick={() => navigate("/studio")}>
                Open Studio
              </button>
              <button className="text-button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <button className="primary-button full-width" onClick={() => navigate("/login")}>
              Login for Author Tools
            </button>
          )}
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <form className="search-form" onSubmit={handleSubmit}>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search questions, theorems, definitions..."
            />
            <button className="primary-button" type="submit">
              Search
            </button>
          </form>
        </header>

        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
