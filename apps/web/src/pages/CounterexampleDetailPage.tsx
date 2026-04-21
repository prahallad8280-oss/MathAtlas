import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExportPdfButton } from "../components/ExportPdfButton";
import { MarkdownContent } from "../components/MarkdownContent";
import { apiRequest } from "../lib/api";
import { formatDateTime } from "../lib/format";
import type { CounterexampleDetail } from "../types";

export function CounterexampleDetailPage() {
  const { slug } = useParams();
  const [counterexample, setCounterexample] = useState<CounterexampleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadCounterexample() {
      if (!slug) {
        return;
      }

      try {
        const payload = await apiRequest<CounterexampleDetail>(`/counterexamples/${slug}`);
        setCounterexample(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load this counterexample.");
      }
    }

    void loadCounterexample();
  }, [slug]);

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (!counterexample) {
    return <div className="empty-state">Loading counterexample page...</div>;
  }

  return (
    <div className="page-stack">
      <div className="button-row">
        <Link className="ghost-button" to="/counterexamples">
          Back to Counterexamples
        </Link>
        <ExportPdfButton targetRef={pageRef} filename={counterexample.slug} />
      </div>

      <article className="detail-card" ref={pageRef}>
        <div className="content-meta-row">
          <span className="pill warm">COUNTEREXAMPLE</span>
          <span className="pill alt">{counterexample.author.name}</span>
        </div>
        <h2>{counterexample.title}</h2>
        <MarkdownContent content={counterexample.explanation} />

        <div className="metadata">
          <span>Created: {formatDateTime(counterexample.createdAt)}</span>
          <span>Updated: {formatDateTime(counterexample.updatedAt)}</span>
        </div>

        {(counterexample.relatedConcepts?.length ?? 0) > 0 ? (
          <section className="linked-section">
            <div className="section-label">Related Concepts</div>
            <div className="chip-list">
              {(counterexample.relatedConcepts ?? []).map((item) => (
                <Link className="chip-link" key={item.id} to={`/concepts/${item.slug}`}>
                  {item.type} • {item.title}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {counterexample.linkedItems.length > 0 ? (
          <section className="linked-section">
            <div className="section-label">Internal References</div>
            <div className="chip-list">
              {counterexample.linkedItems.map((item) =>
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
