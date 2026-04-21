import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExportPdfButton } from "../components/ExportPdfButton";
import { MarkdownContent } from "../components/MarkdownContent";
import { apiRequest } from "../lib/api";
import { formatDateTime } from "../lib/format";
import type { QuestionDetail } from "../types";

export function QuestionDetailPage() {
  const { slug } = useParams();
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadQuestion() {
      if (!slug) {
        return;
      }

      try {
        const payload = await apiRequest<QuestionDetail>(`/questions/${slug}`);
        setQuestion(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load the question.");
      }
    }

    void loadQuestion();
  }, [slug]);

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (!question) {
    return <div className="empty-state">Loading question page...</div>;
  }

  return (
    <div className="page-stack">
      <div className="button-row">
        <Link className="ghost-button" to="/questions">
          Back to Questions
        </Link>
        <ExportPdfButton targetRef={pageRef} filename={question.slug} />
      </div>

      <article className="detail-card" ref={pageRef}>
        <div className="content-meta-row">
          <span className="pill">{question.subject.name}</span>
          <span className="pill alt">
            {question.year} {question.session}
          </span>
        </div>

        <h2>Question</h2>
        <MarkdownContent content={question.questionText} />

        <div className="metadata">
          <span>Question author: {question.author.name}</span>
          <span>Created: {formatDateTime(question.createdAt)}</span>
          <span>Updated: {formatDateTime(question.updatedAt)}</span>
        </div>

        <div className="button-row">
          <button className="primary-button" onClick={() => setShowSolution((value) => !value)}>
            {showSolution ? "Hide Solution" : "View Solution"}
          </button>
        </div>

        {showSolution && question.solution ? (
          <section className="solution-panel">
            <div className="section-label">Detailed Solution</div>
            <MarkdownContent content={question.solution.content} />
            <div className="metadata">
              <span>Solution author: {question.solution.author?.name ?? question.author.name}</span>
              <span>Updated: {formatDateTime(question.solution.updatedAt)}</span>
            </div>
          </section>
        ) : null}

        {question.linkedItems.length > 0 ? (
          <section className="linked-section">
            <div className="section-label">Linked Knowledge</div>
            <div className="chip-list">
              {question.linkedItems.map((item) =>
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
