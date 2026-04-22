import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExportPdfButton } from "../components/ExportPdfButton";
import { apiRequest } from "../lib/api";
import { formatDateTime } from "../lib/format";
import type { QuestionDetail } from "../types";
import { fallbackQuestions } from "../lib/fallbackData";

const MarkdownContent = lazy(() =>
  import("../components/MarkdownContent").then((module) => ({ default: module.MarkdownContent })),
);

export function QuestionDetailPage() {
  const { slug } = useParams();
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadQuestion() {
      if (!slug) {
        return;
      }

      try {
        const payload = await apiRequest<QuestionDetail>(`/questions/${slug}`);
        setQuestion(payload);
        setIsUsingFallback(false);
      } catch (loadError) {
        console.warn("Using fallback question detail", loadError);
        const fallbackQuestion = fallbackQuestions.find((item) => item.slug === slug) ?? fallbackQuestions[0];
        setQuestion({ ...fallbackQuestion, linkedItems: [] });
        setIsUsingFallback(true);
      }
    }

    void loadQuestion();
  }, [slug]);

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

      {isUsingFallback ? (
        <div className="home-fallback-note">Live API data is temporarily unavailable. Showing a preview question.</div>
      ) : null}

      <article className="detail-card" ref={pageRef}>
        <div className="content-meta-row">
          <span className="pill">{question.subject.name}</span>
          <span className="pill alt">
            {question.year} {question.session}
          </span>
        </div>

        <h2>Question</h2>
        <Suspense fallback={<div className="empty-state">Loading mathematical notation...</div>}>
          <MarkdownContent content={question.questionText} />
        </Suspense>

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
            <Suspense fallback={<div className="empty-state">Loading mathematical notation...</div>}>
              <MarkdownContent content={question.solution.content} />
            </Suspense>
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
