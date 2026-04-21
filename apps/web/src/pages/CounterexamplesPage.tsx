import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { excerpt, formatDateTime } from "../lib/format";
import type { Counterexample } from "../types";

export function CounterexamplesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [counterexamples, setCounterexamples] = useState<Counterexample[]>([]);
  const [error, setError] = useState<string | null>(null);

  const q = searchParams.get("q") ?? "";

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

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Counterexamples</div>
          <h2>Stress-test mathematical intuition with sharp failures and edge cases.</h2>
        </div>
      </section>

      <section className="filter-bar">
        <input
          value={q}
          onChange={(event) => {
            const next = new URLSearchParams(searchParams);
            if (event.target.value) next.set("q", event.target.value);
            else next.delete("q");
            setSearchParams(next);
          }}
          placeholder="Search counterexamples"
        />
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      <section className="card-grid">
        {counterexamples.map((counterexample) => (
          <Link className="content-card link-card warm" key={counterexample.id} to={`/counterexamples/${counterexample.slug}`}>
            <div className="content-meta-row">
              <span className="pill warm">COUNTEREXAMPLE</span>
              <span className="pill alt">{counterexample.relatedConcepts?.length ?? 0} linked concepts</span>
            </div>
            <h3>{counterexample.title}</h3>
            <p>{excerpt(counterexample.explanation)}</p>
            <div className="metadata">
              <span>{counterexample.author.name}</span>
              <span>{formatDateTime(counterexample.createdAt)}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
