import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { excerpt, formatDateTime } from "../lib/format";
import type { Concept } from "../types";
import { fallbackConcepts } from "../lib/fallbackData";

function getFallbackConceptsPreview(q: string, type: string) {
  const isTheoryView = type === "THEORY";

  return fallbackConcepts.filter((concept) => {
    const matchesQuery = q
      ? `${concept.title} ${concept.content} ${concept.author.name}`.toLowerCase().includes(q.toLowerCase())
      : true;
    const matchesType = isTheoryView
      ? concept.type === "THEOREM" || concept.type === "RESULT"
      : type
        ? concept.type === type
        : true;

    return matchesQuery && matchesType;
  });
}

export function ConceptsPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const [concepts, setConcepts] = useState<Concept[]>(() => getFallbackConceptsPreview(q, type));
  const [isLoadingLiveContent, setIsLoadingLiveContent] = useState(true);
  const isTheoryView = type === "THEORY";

  const filteredConcepts = useMemo(
    () =>
      isTheoryView
        ? concepts.filter((concept) => concept.type === "THEOREM" || concept.type === "RESULT")
        : concepts,
    [concepts, isTheoryView],
  );

  useEffect(() => {
    async function loadConcepts() {
      const fallbackPreview = getFallbackConceptsPreview(q, type);
      const apiType = type && type !== "THEORY" ? type : "";

      try {
        setConcepts(fallbackPreview);
        setIsLoadingLiveContent(true);
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (apiType) params.set("type", apiType);

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

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <h2>
            {isTheoryView
              ? "Explore theorems and results with internal cross-links."
              : "Explore definitions and concept pages with internal cross-links."}
          </h2>
        </div>
      </section>

      <section className="card-grid">
        {filteredConcepts.map((concept) => (
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
