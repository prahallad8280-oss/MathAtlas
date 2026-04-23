import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { excerpt, formatDateTime } from "../lib/format";
import type { Counterexample } from "../types";
import { fallbackCounterexamples } from "../lib/fallbackData";

function getFallbackCounterexamplesPreview(q: string) {
  return fallbackCounterexamples.filter((counterexample) =>
    q
      ? `${counterexample.title} ${counterexample.explanation} ${(counterexample.relatedConcepts ?? [])
          .map((item) => item.title)
          .join(" ")}`.toLowerCase().includes(q.toLowerCase())
      : true,
  );
}

export function CounterexamplesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const concept = searchParams.get("concept") ?? "";
  const [counterexamples, setCounterexamples] = useState<Counterexample[]>(() => getFallbackCounterexamplesPreview(q));

  useEffect(() => {
    async function loadCounterexamples() {
      const fallbackPreview = getFallbackCounterexamplesPreview(q);

      try {
        setCounterexamples(fallbackPreview);
        const payload = await apiRequest<Counterexample[]>(`/counterexamples${q ? `?q=${encodeURIComponent(q)}` : ""}`);
        setCounterexamples(payload);
      } catch (loadError) {
        console.warn("Using fallback counterexamples", loadError);
        setCounterexamples(fallbackPreview);
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

  const relatedConceptOptions = useMemo(() => {
    const conceptMap = new Map<string, { slug: string; title: string }>();

    for (const counterexample of counterexamples) {
      for (const relatedConcept of counterexample.relatedConcepts ?? []) {
        if (!conceptMap.has(relatedConcept.slug)) {
          conceptMap.set(relatedConcept.slug, {
            slug: relatedConcept.slug,
            title: relatedConcept.title,
          });
        }
      }
    }

    return Array.from(conceptMap.values()).sort((left, right) => left.title.localeCompare(right.title));
  }, [counterexamples]);

  const filteredCounterexamples = useMemo(
    () =>
      concept
        ? counterexamples.filter((counterexample) =>
            (counterexample.relatedConcepts ?? []).some((item) => item.slug === concept),
          )
        : counterexamples,
    [concept, counterexamples],
  );

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <h2>Explore counterexamples and edge cases with theorems, definitions, and results beside them.</h2>
        </div>
      </section>

      <section className="card-grid">
        {filteredCounterexamples.length > 0 ? (
          filteredCounterexamples.map((counterexample) => (
            <Link
              className="content-card link-card"
              key={counterexample.id}
              to={`/counterexamples/${counterexample.slug}`}
              state={{ previewCounterexample: { ...counterexample, linkedItems: [] } }}
            >
              <div className="content-meta-row">
                <span className="pill">COUNTEREXAMPLE</span>
              </div>
              <h3>{counterexample.title}</h3>
              <p>{excerpt(counterexample.explanation)}</p>
              <div className="metadata">
                <span>{counterexample.author.name}</span>
                <span>{formatDateTime(counterexample.createdAt)}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="empty-state">No counterexamples matched the current filters.</div>
        )}
      </section>
    </div>
  );
}
