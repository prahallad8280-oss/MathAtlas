import { FormEvent, useEffect, useMemo, useState } from "react";
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

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

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

  const sidebarPosts = sortedCounterexamples.slice(0, 6);

  if (isLoading && counterexamples.length === 0) {
    return <ListPageShell />;
  }

  return (
    <div className="page-stack">
      <section className="counterexample-hub">
        <aside className="counterexample-rail">
          <div className="counterexample-rail-brand">
            <div className="section-label">Math Counterexamples</div>
            <h2>Exceptions to rules and intuition.</h2>
          </div>

          <form className="counterexample-search-form" onSubmit={handleSearchSubmit}>
            <input
              value={q}
              onChange={(event) => updateFilter("q", event.target.value)}
              placeholder="Search counterexamples..."
              aria-label="Search counterexamples"
            />
            <button className="counterexample-search-button" type="submit" aria-label="Search counterexamples">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M10.5 4.5a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm0-1.5a7.5 7.5 0 1 1 4.72 13.33l4.72 4.72a.75.75 0 1 1-1.06 1.06l-4.72-4.72A7.5 7.5 0 0 1 10.5 3Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </form>

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
              <span>{filteredCounterexamples.length} entries</span>
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

          {filteredCounterexamples.length > 0 ? (
            <div className="counterexample-archive-grid">
              {filteredCounterexamples.map((counterexample) => (
                <Link className="counterexample-archive-card" key={counterexample.id} to={`/counterexamples/${counterexample.slug}`}>
                  <div className="counterexample-archive-type">
                    {(counterexample.relatedConcepts ?? []).slice(0, 2).map((item) => item.type).join(" / ") || "COUNTEREXAMPLE"}
                  </div>
                  <div className="counterexample-archive-date">{formatDateTime(counterexample.createdAt)}</div>
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
          ) : (
            <div className="empty-state">No counterexamples matched the current filters.</div>
          )}
        </div>
      </section>
    </div>
  );
}
