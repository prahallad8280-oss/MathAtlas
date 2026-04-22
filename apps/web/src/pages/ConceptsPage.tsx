import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { excerpt, formatDateTime } from "../lib/format";
import type { Concept, ConceptType } from "../types";
import { fallbackConcepts } from "../lib/fallbackData";

export function ConceptsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

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
        setIsUsingFallback(false);
      } catch (loadError) {
        console.warn("Using fallback concepts", loadError);
        setConcepts(
          fallbackConcepts.filter((concept) => {
            const matchesQuery = q
              ? `${concept.title} ${concept.content} ${concept.author.name}`.toLowerCase().includes(q.toLowerCase())
              : true;
            const matchesType = type ? concept.type === type : true;

            return matchesQuery && matchesType;
          }),
        );
        setIsUsingFallback(true);
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

      {isUsingFallback ? (
        <div className="home-fallback-note">Live API data is temporarily unavailable. Showing preview concepts.</div>
      ) : null}

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
