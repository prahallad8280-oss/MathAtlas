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
      <div className="academic-toolbar">
        <div className="academic-breadcrumbs">
          <Link to="/">Home</Link>
          <span>&gt;</span>
          <Link to="/concepts">Concepts</Link>
          <span>&gt;</span>
          <span>{concept.title}</span>
        </div>

        <div className="button-row">
          <Link className="ghost-button" to="/concepts">
            Back to Concepts
          </Link>
          <ExportPdfButton targetRef={pageRef} filename={concept.slug} />
        </div>
      </div>

      <div className="academic-layout">
        <aside className="academic-sidebar">
          <div className="academic-side-card">
            <div className="academic-side-header">Contents</div>
            <nav className="academic-outline">
              <a href="#concept-statement">Statement</a>
              <a href="#concept-counterexamples">Related Counterexamples</a>
              <a href="#concept-internal-links">Internal References</a>
              <a href="#concept-metadata">Metadata</a>
            </nav>
          </div>

          <div className="academic-side-card">
            <div className="academic-side-header">{concept.type}</div>
            <p>
              This concept page follows a textbook reading pattern, pairing the main statement with linked
              counterexamples and cross-references.
            </p>
          </div>

          {concept.relatedCounters && concept.relatedCounters.length > 0 ? (
            <div className="academic-side-card">
              <div className="academic-side-header">Counterexamples</div>
              <div className="academic-side-links">
                {concept.relatedCounters.map((item) => (
                  <Link key={item.id} to={`/counterexamples/${item.slug}`}>
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <article className="academic-article" ref={pageRef}>
          <div className="academic-article-header">
            <div className="content-meta-row">
              <span className="pill">{concept.type}</span>
              <span className="pill alt">{concept.author.name}</span>
            </div>
            <h2>{concept.title}</h2>
            <p>
              Read this concept as a study page: the formal content first, then the associated
              counterexamples, and finally the references that connect it into the larger knowledge graph.
            </p>
          </div>

          <section className="academic-section" id="concept-statement">
            <h3>Statement</h3>
            <MarkdownContent content={concept.content} />
          </section>

          <section className="academic-section" id="concept-counterexamples">
            <h3>Related Counterexamples</h3>
            {concept.relatedCounters && concept.relatedCounters.length > 0 ? (
              <div className="academic-reference-list">
                {concept.relatedCounters.map((item) => (
                  <Link className="academic-reference-item" key={item.id} to={`/counterexamples/${item.slug}`}>
                    <span>COUNTEREXAMPLE</span>
                    <strong>{item.title}</strong>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="academic-empty-text">No related counterexamples are attached to this concept yet.</p>
            )}
          </section>

          <section className="academic-section" id="concept-internal-links">
            <h3>Internal References</h3>
            {concept.linkedItems.length > 0 ? (
              <div className="academic-reference-list">
                {concept.linkedItems.map((item) =>
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
              <p className="academic-empty-text">No internal references were detected in this concept.</p>
            )}
          </section>

          <section className="academic-section" id="concept-metadata">
            <h3>Metadata</h3>
            <div className="academic-metadata-grid">
              <div>
                <span>Author</span>
                <strong>{concept.author.name}</strong>
              </div>
              <div>
                <span>Created</span>
                <strong>{formatDateTime(concept.createdAt)}</strong>
              </div>
              <div>
                <span>Updated</span>
                <strong>{formatDateTime(concept.updatedAt)}</strong>
              </div>
              <div>
                <span>Linked Counterexamples</span>
                <strong>{concept.relatedCounters?.length ?? 0}</strong>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
