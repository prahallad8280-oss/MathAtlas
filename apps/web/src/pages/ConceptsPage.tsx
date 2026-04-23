import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { excerpt, formatDateTime } from "../lib/format";
import type { Concept, ConceptType } from "../types";
import { fallbackConcepts } from "../lib/fallbackData";

function getFallbackConceptsPreview(q: string, type: string) {
  return fallbackConcepts.filter((concept) => {
    const matchesQuery = q
      ? `${concept.title} ${concept.content} ${concept.author.name}`.toLowerCase().includes(q.toLowerCase())
      : true;
    const matchesType = type ? concept.type === type : true;

    return matchesQuery && matchesType;
  });
}

export function ConceptsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const [concepts, setConcepts] = useState<Concept[]>(() => getFallbackConceptsPreview(q, type));
  const [isLoadingLiveContent, setIsLoadingLiveContent] = useState(true);

  useEffect(() => {
    async function loadConcepts() {
      const fallbackPreview = getFallbackConceptsPreview(q, type);

      try {
        setConcepts(fallbackPreview);
        setIsLoadingLiveContent(true);
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (type) params.set("type", type);

        const payload = await apiRequest<Concept[]>(`/concepts${params.toString() ? `?${params.toString()}` : ""}`);
        setConcepts(payload);
      } catch (loadError) {
        console.warn("Using fallback concepts", loadError);
        setConcepts(fallbackPreview);
      } finally {
        setIsLoadingLiveContent(false);
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
          <h2>Explore theorems, definitions, and results with internal cross-links.</h2>
        </div>
      </section>

      <section className="card-grid">
        {concepts.map((concept) => (
          <Link
            className="content-card link-card"
            key={concept.id}
            to={`/concepts/${concept.slug}`}
            state={{
              previewConcept: {
                ...concept,
                linkedItems: [],
                relatedCounters: concept.relatedCounters ?? [],
              },
            }}
          >
            <div className="content-meta-row">
              <span className="pill">{concept.type}</span>
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
