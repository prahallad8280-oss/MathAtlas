import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { excerpt, formatDateTime } from "../lib/format";
import type { Counterexample } from "../types";

type PopularConcept = {
  slug: string;
  title: string;
  type: string;
  count: number;
};

export function CounterexamplesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [counterexamples, setCounterexamples] = useState<Counterexample[]>([]);
  const [error, setError] = useState<string | null>(null);

  const q = searchParams.get("q") ?? "";
  const concept = searchParams.get("concept") ?? "";

  useEffect(() => {
    async function loadCounterexamples() {
      try {
        const payload = await apiRequest<Counterexample[]>(`/counterexamples${q ? `?q=${encodeURIComponent(q)}` : ""}`);
        setCounterexamples(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load counterexamples.");
      }
    }

    void loadCounterexamples();
  }, [q]);

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

  return (
    <div className="page-stack">
      <section className="counterexample-hub">
        <aside className="counterexample-rail">
          <div className="counterexample-rail-brand">
            <div className="section-label">Math Counterexamples</div>
            <h2>Exceptions to rules and intuition.</h2>
            <p>
              A public archive of failures, edge cases, and minimal hypotheses that keep theorems honest.
            </p>
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
              <Link to="/concepts">Theory Index</Link>
              <Link to="/questions">Questions</Link>
              <Link to="/search">Search</Link>
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

          <div className="counterexample-stage-header">
            <div>
              <div className="eyebrow">Counterexample Atlas</div>
              <h2>Counterexamples that sharpen mathematical reasoning.</h2>
              <p>
                Inspired by mathematical resource sites and textbook reading layouts, this page highlights
                why one exception can reshape an entire statement.
              </p>
            </div>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}

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
