import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExportPdfButton } from "../components/ExportPdfButton";
import { MarkdownContent } from "../components/MarkdownContent";
import { apiRequest } from "../lib/api";
import { formatDateTime } from "../lib/format";
import type { ConceptDetail } from "../types";

export function ConceptDetailPage() {
  const { slug } = useParams();
  const [concept, setConcept] = useState<ConceptDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadConcept() {
      if (!slug) {
        return;
      }

      try {
        const payload = await apiRequest<ConceptDetail>(`/concepts/${slug}`);
        setConcept(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load this concept.");
      }
    }

    void loadConcept();
  }, [slug]);

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (!concept) {
    return <div className="empty-state">Loading concept page...</div>;
  }

  return (
    <div className="page-stack">
      <div className="button-row">
        <Link className="ghost-button" to="/concepts">
          Back to Concepts
        </Link>
        <ExportPdfButton targetRef={pageRef} filename={concept.slug} />
      </div>

      <article className="detail-card" ref={pageRef}>
        <div className="content-meta-row">
          <span className="pill">{concept.type}</span>
          <span className="pill alt">{concept.author.name}</span>
        </div>
        <h2>{concept.title}</h2>
        <MarkdownContent content={concept.content} />

        <div className="metadata">
          <span>Created: {formatDateTime(concept.createdAt)}</span>
          <span>Updated: {formatDateTime(concept.updatedAt)}</span>
        </div>

        {concept.relatedCounters && concept.relatedCounters.length > 0 ? (
          <section className="linked-section">
            <div className="section-label">Related Counterexamples</div>
            <div className="chip-list">
              {concept.relatedCounters.map((item) => (
                <Link className="chip-link" key={item.id} to={`/counterexamples/${item.slug}`}>
                  {item.title}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {concept.linkedItems.length > 0 ? (
          <section className="linked-section">
            <div className="section-label">Internal References</div>
            <div className="chip-list">
              {concept.linkedItems.map((item) =>
                item.href ? (
                  <Link className="chip-link" key={`${item.kind}-${item.title}`} to={item.href}>
                    {item.label} • {item.title}
                  </Link>
                ) : (
                  <span className="chip-link unresolved" key={`${item.kind}-${item.title}`}>
                    {item.label} • {item.title}
                  </span>
                ),
              )}
            </div>
          </section>
        ) : null}
      </article>
    </div>
  );
}
