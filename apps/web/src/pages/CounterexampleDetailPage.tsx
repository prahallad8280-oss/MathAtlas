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
      <div className="academic-toolbar">
        <div className="academic-breadcrumbs">
          <Link to="/">Home</Link>
          <span>&gt;</span>
          <Link to="/counterexamples">Counterexamples</Link>
          <span>&gt;</span>
          <span>{counterexample.title}</span>
        </div>

        <div className="button-row">
          <Link className="ghost-button" to="/counterexamples">
            Back to Counterexamples
          </Link>
          <ExportPdfButton targetRef={pageRef} filename={counterexample.slug} />
        </div>
      </div>

      <div className="academic-layout">
        <aside className="academic-sidebar">
          <div className="academic-side-card">
            <div className="academic-side-header">Contents</div>
            <nav className="academic-outline">
              <a href="#counterexample-overview">Overview</a>
              <a href="#counterexample-related-concepts">Related Concepts</a>
              <a href="#counterexample-internal-links">Internal References</a>
              <a href="#counterexample-metadata">Metadata</a>
            </nav>
          </div>

          <div className="academic-side-card">
            <div className="academic-side-header">Counterexample Note</div>
            <p>
              One carefully chosen exception is enough to disprove a universal claim or reveal a missing
              hypothesis.
            </p>
          </div>

          {(counterexample.relatedConcepts?.length ?? 0) > 0 ? (
            <div className="academic-side-card">
              <div className="academic-side-header">Linked Concepts</div>
              <div className="academic-side-links">
                {(counterexample.relatedConcepts ?? []).map((item) => (
                  <Link key={item.id} to={`/concepts/${item.slug}`}>
                    {item.type} - {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <article className="academic-article" ref={pageRef}>
          <div className="academic-article-header">
            <div className="content-meta-row">
              <span className="pill warm">COUNTEREXAMPLE</span>
              <span className="pill alt">{counterexample.author.name}</span>
            </div>
            <h2>{counterexample.title}</h2>
            <p>
              This page is organized like a mathematical reading note: first the failure, then the concepts
              it interacts with, and finally the internal references that extend the argument.
            </p>
          </div>

          <section className="academic-section" id="counterexample-overview">
            <h3>Overview</h3>
            <MarkdownContent content={counterexample.explanation} />
          </section>

          <section className="academic-section" id="counterexample-related-concepts">
            <h3>Related Concepts</h3>
            {(counterexample.relatedConcepts?.length ?? 0) > 0 ? (
              <div className="chip-list">
                {(counterexample.relatedConcepts ?? []).map((item) => (
                  <Link className="chip-link" key={item.id} to={`/concepts/${item.slug}`}>
                    {item.type} - {item.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="academic-empty-text">No related concepts are linked to this counterexample yet.</p>
            )}
          </section>

          <section className="academic-section" id="counterexample-internal-links">
            <h3>Internal References</h3>
            {counterexample.linkedItems.length > 0 ? (
              <div className="academic-reference-list">
                {counterexample.linkedItems.map((item) =>
                  item.href ? (
                    <Link className="academic-reference-item" key={`${item.kind}-${item.title}`} to={item.href}>
                      <span>{item.label}</span>
                      <strong>{item.title}</strong>
                    </Link>
                  ) : (
                    <div className="academic-reference-item unresolved" key={`${item.kind}-${item.title}`}>
                      <span>{item.label}</span>
                      <strong>{item.title}</strong>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="academic-empty-text">No internal references were detected in this entry.</p>
            )}
          </section>

          <section className="academic-section" id="counterexample-metadata">
            <h3>Metadata</h3>
            <div className="academic-metadata-grid">
              <div>
                <span>Author</span>
                <strong>{counterexample.author.name}</strong>
              </div>
              <div>
                <span>Created</span>
                <strong>{formatDateTime(counterexample.createdAt)}</strong>
              </div>
              <div>
                <span>Updated</span>
                <strong>{formatDateTime(counterexample.updatedAt)}</strong>
              </div>
              <div>
                <span>Linked Concepts</span>
                <strong>{counterexample.relatedConcepts?.length ?? 0}</strong>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
