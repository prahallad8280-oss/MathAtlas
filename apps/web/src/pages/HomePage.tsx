import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { formatDateTime, excerpt } from "../lib/format";
import type { DashboardPayload } from "../types";

export function HomePage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const payload = await apiRequest<DashboardPayload>("/meta/dashboard");
        setData(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
      }
    }

    void loadDashboard();
  }, []);

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (!data) {
    return <div className="empty-state">Loading the mathematical atlas...</div>;
  }

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <div className="eyebrow">Linked Mathematical Knowledge</div>
          <h2>Browse CSIR NET questions together with theorems, definitions, and counterexamples.</h2>
          <p>
            This platform keeps questions public, solutions collapsible, and theory interconnected through
            Wikipedia-style links such as <code>[[Closed Graph Theorem]]</code>.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="primary-button" to="/questions">
            Explore Questions
          </Link>
          <Link className="ghost-button" to="/concepts">
            Open Theory Index
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total Questions</span>
          <strong>{data.stats.questionCount}</strong>
        </article>
        <article className="stat-card">
          <span>Theorems / Definitions / Results</span>
          <strong>{data.stats.conceptCount}</strong>
        </article>
        <article className="stat-card">
          <span>Counterexamples</span>
          <strong>{data.stats.counterexampleCount}</strong>
        </article>
      </section>

      <section className="grid-two">
        <article className="content-card">
          <div className="section-label">Recent Questions</div>
          <div className="stack-list">
            {data.recentQuestions.map((question) => (
              <Link key={question.id} className="list-link-card" to={`/questions/${question.slug}`}>
                <strong>
                  {question.year} {question.session} • {question.subject.name}
                </strong>
                <span>{excerpt(question.questionText, 140)}</span>
                <small>
                  {question.author.name} • {formatDateTime(question.createdAt)}
                </small>
              </Link>
            ))}
          </div>
        </article>

        <article className="content-card">
          <div className="section-label">Recent Theory Nodes</div>
          <div className="stack-list">
            {data.recentConcepts.map((concept) => (
              <Link key={concept.id} className="list-link-card" to={`/concepts/${concept.slug}`}>
                <strong>
                  {concept.type} • {concept.title}
                </strong>
                <span>{excerpt(concept.content, 140)}</span>
                <small>
                  {concept.author.name} • {formatDateTime(concept.createdAt)}
                </small>
              </Link>
            ))}
            {data.recentCounterexamples.map((counterexample) => (
              <Link
                key={counterexample.id}
                className="list-link-card warm"
                to={`/counterexamples/${counterexample.slug}`}
              >
                <strong>COUNTEREXAMPLE • {counterexample.title}</strong>
                <span>{excerpt(counterexample.explanation, 140)}</span>
                <small>
                  {counterexample.author.name} • {formatDateTime(counterexample.createdAt)}
                </small>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
