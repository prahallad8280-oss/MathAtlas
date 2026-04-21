import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { excerpt, formatDateTime } from "../lib/format";
import type { Concept, ConceptType } from "../types";

export function ConceptsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [error, setError] = useState<string | null>(null);

  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";

  useEffect(() => {
    async function loadConcepts() {
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (type) params.set("type", type);

        const payload = await apiRequest<Concept[]>(`/concepts${params.toString() ? `?${params.toString()}` : ""}`);
        setConcepts(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load concepts.");
      }
    }

    void loadConcepts();
  }, [q, type]);

  function updateFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next);
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Theory Index</div>
          <h2>Explore theorems, definitions, and results with internal cross-links.</h2>
        </div>
      </section>

      <section className="filter-bar">
        <input value={q} onChange={(event) => updateFilter("q", event.target.value)} placeholder="Search concepts" />
        <select value={type} onChange={(event) => updateFilter("type", event.target.value)}>
          <option value="">All concept types</option>
          {(["THEOREM", "DEFINITION", "RESULT"] as ConceptType[]).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      <section className="card-grid">
        {concepts.map((concept) => (
          <Link className="content-card link-card" key={concept.id} to={`/concepts/${concept.slug}`}>
            <div className="content-meta-row">
              <span className="pill">{concept.type}</span>
              <span className="pill alt">{concept._count?.relatedCounters ?? 0} counters</span>
            </div>
            <h3>{concept.title}</h3>
            <p>{excerpt(concept.content)}</p>
            <div className="metadata">
              <span>{concept.author.name}</span>
              <span>{formatDateTime(concept.createdAt)}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
