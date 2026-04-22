import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { ListPageShell } from "../components/LoadingShell";
import { excerpt, formatDateTime } from "../lib/format";
import type { Counterexample } from "../types";
import { fallbackCounterexamples } from "../lib/fallbackData";

type PopularConcept = {
  slug: string;
  title: string;
  type: string;
  count: number;
};

export function CounterexamplesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [counterexamples, setCounterexamples] = useState<Counterexample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("counterexample-mode") === "light";
  });

  const q = searchParams.get("q") ?? "";
  const concept = searchParams.get("concept") ?? "";

  useEffect(() => {
    async function loadCounterexamples() {
      try {
        setIsLoading(true);
        const payload = await apiRequest<Counterexample[]>(`/counterexamples${q ? `?q=${encodeURIComponent(q)}` : ""}`);
        setCounterexamples(payload);
        setIsUsingFallback(false);
      } catch (loadError) {
        console.warn("Using fallback counterexamples", loadError);
        setCounterexamples(
          fallbackCounterexamples.filter((counterexample) =>
            q
              ? `${counterexample.title} ${counterexample.explanation}`.toLowerCase().includes(q.toLowerCase())
              : true,
          ),
        );
        setIsUsingFallback(true);
      } finally {
        setIsLoading(false);
      }
    }

    void loadCounterexamples();
  }, [q]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("counterexample-mode", isLightMode ? "light" : "dark");
  }, [isLightMode]);

  function updateFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }

    setSearchParams(next);
  }

  const popularConcepts = useMemo(() => {
    const conceptMap = new Map<string, PopularConcept>();

    for (const counterexample of counterexamples) {
      for (const relatedConcept of counterexample.relatedConcepts ?? []) {
        const existing = conceptMap.get(relatedConcept.id);

        if (existing) {
          existing.count += 1;
        } else {
          conceptMap.set(relatedConcept.id, {
            slug: relatedConcept.slug,
            title: relatedConcept.title,
            type: relatedConcept.type,
            count: 1,
          });
        }
      }
    }

    return Array.from(conceptMap.values()).sort((left, right) => right.count - left.count);
  }, [counterexamples]);

  const sortedCounterexamples = [...counterexamples].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  const filteredCounterexamples = concept
    ? sortedCounterexamples.filter((counterexample) =>
        (counterexample.relatedConcepts ?? []).some((item) => item.slug === concept),
      )
    : sortedCounterexamples;

  const featuredCounterexamples = filteredCounterexamples.slice(0, 3);
  const archiveCounterexamples = filteredCounterexamples.slice(3);
  const sidebarPosts = sortedCounterexamples.slice(0, 6);

  if (isLoading && counterexamples.length === 0) {
    return <ListPageShell />;
  }

  return (
    <div className="page-stack">
      <section className={isLightMode ? "counterexample-hub counterexample-hub-light" : "counterexample-hub"}>
        <aside className="counterexample-rail">
          <div className="counterexample-rail-brand">
            <div className="section-label">Math Counterexamples</div>
            <h2>Exceptions to rules and intuition.</h2>
          </div>

          <div className="counterexample-search-box">
            <input
              value={q}
              onChange={(event) => updateFilter("q", event.target.value)}
              placeholder="Search counterexamples..."
            />
          </div>

          <div className="counterexample-rail-section">
            <div className="section-label">Recent Posts</div>
            <div className="counterexample-rail-links">
              {sidebarPosts.map((counterexample) => (
                <Link key={counterexample.id} to={`/counterexamples/${counterexample.slug}`}>
                  {counterexample.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="counterexample-rail-section">
            <div className="section-label">Themes</div>
            <div className="counterexample-rail-links compact">
              {popularConcepts.slice(0, 8).map((item) => (
                <button
                  className={concept === item.slug ? "counterexample-rail-button active" : "counterexample-rail-button"}
                  key={item.slug}
                  onClick={() => updateFilter("concept", concept === item.slug ? "" : item.slug)}
                  type="button"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="counterexample-stage">
          <div className="counterexample-stage-topbar">
            <div className="counterexample-stage-links">
              <Link to="/">Home</Link>
              <Link to="/concepts">Theory Index</Link>
              <Link to="/questions">Questions</Link>
            </div>
            <div className="counterexample-stage-links">
              <button
                aria-label={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
                aria-pressed={isLightMode}
                className={isLightMode ? "counterexample-mode-toggle is-light" : "counterexample-mode-toggle"}
                onClick={() => setIsLightMode((current) => !current)}
                type="button"
              >
                <span className="counterexample-mode-toggle-thumb">
                  {isLightMode ? (
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
              {concept ? (
                <button className="counterexample-clear-button" onClick={() => updateFilter("concept", "")} type="button">
                  Clear theme
                </button>
              ) : null}
            </div>
          </div>

          {isUsingFallback ? (
            <div className="home-fallback-note">Live API data is temporarily unavailable. Showing preview counterexamples.</div>
          ) : null}

          {featuredCounterexamples.length > 0 ? (
            <div className="counterexample-feature-grid">
              {featuredCounterexamples.map((counterexample, index) => (
                <Link
                  className={`counterexample-feature-card tone-${(index % 3) + 1}`}
                  key={counterexample.id}
                  to={`/counterexamples/${counterexample.slug}`}
                >
                  <div className="counterexample-feature-art">
                    <span>{counterexample.relatedConcepts?.[0]?.title ?? "Counterexample"}</span>
                  </div>
                  <div className="counterexample-feature-copy">
                    <div className="counterexample-feature-meta">
                      <span>{counterexample.relatedConcepts?.[0]?.type ?? "COUNTEREXAMPLE"}</span>
                      <span>{formatDateTime(counterexample.createdAt)}</span>
                    </div>
                    <h3>{counterexample.title}</h3>
                    <p>{excerpt(counterexample.explanation, 135)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">No counterexamples matched the current filters.</div>
          )}

          {archiveCounterexamples.length > 0 ? (
            <div className="counterexample-archive-grid">
              {archiveCounterexamples.map((counterexample) => (
                <Link className="counterexample-archive-card" key={counterexample.id} to={`/counterexamples/${counterexample.slug}`}>
                  <div className="counterexample-archive-type">
                    {(counterexample.relatedConcepts ?? []).slice(0, 2).map((item) => item.type).join(" / ") || "COUNTEREXAMPLE"}
                  </div>
                  <h3>{counterexample.title}</h3>
                  <p>{excerpt(counterexample.explanation, 120)}</p>
                  <div className="counterexample-archive-tags">
                    {(counterexample.relatedConcepts ?? []).slice(0, 3).map((item) => (
                      <span className="counterexample-tag" key={item.id}>
                        {item.title}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
