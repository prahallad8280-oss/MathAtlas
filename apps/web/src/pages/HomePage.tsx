import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { excerpt, formatDateTime } from "../lib/format";
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

  const featuredSubjects = Array.from(
    new Map(data.recentQuestions.map((question) => [question.subject.id, question.subject])).values(),
  );
  const activityItems = [
    ...data.recentConcepts.map((concept) => ({
      key: `concept-${concept.id}`,
      href: `/concepts/${concept.slug}`,
      title: concept.title,
      label: concept.type,
    })),
    ...data.recentCounterexamples.map((counterexample) => ({
      key: `counterexample-${counterexample.id}`,
      href: `/counterexamples/${counterexample.slug}`,
      title: counterexample.title,
      label: "COUNTEREXAMPLE",
    })),
  ].slice(0, 7);

  return (
    <div className="page-stack">
      <section className="exchange-layout">
        <div className="exchange-main-column">
          <div className="exchange-panel">
            <div className="exchange-header">
              <div>
                <div className="eyebrow">Mathematical Blog</div>
                <h2>Explore our questions and connected mathematical ideas.</h2>
                <p>
                  Browse CSIR NET questions together with theorems, definitions, results, and counterexamples
                  in one public reading experience with internal wiki-style links.
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
            </div>

            <div className="topic-cloud">
              {featuredSubjects.map((subject) => (
                <Link className="topic-chip" key={subject.id} to={`/questions?subject=${subject.slug}`}>
                  {subject.name}
                </Link>
              ))}
              <Link className="topic-chip subtle" to="/subjects">
                More subjects
              </Link>
            </div>

            <div className="feed-toolbar">
              <div className="feed-toolbar-label">Latest Public Questions</div>
              <div className="feed-mode-tabs">
                <span className="feed-mode-pill active">Recent</span>
                <span className="feed-mode-pill">{data.stats.questionCount} questions</span>
                <span className="feed-mode-pill">{data.stats.conceptCount} concepts</span>
                <span className="feed-mode-pill">{data.stats.counterexampleCount} counters</span>
              </div>
            </div>

            <div className="feed-list">
              {data.recentQuestions.map((question) => (
                <article className="feed-item" key={question.id}>
                  <div className="feed-metrics">
                    <strong>{question.year}</strong>
                    <span>{question.session}</span>
                    <small>{question.solution ? "1 solution" : "No solution"}</small>
                  </div>

                  <div className="feed-body">
                    <Link className="feed-title" to={`/questions/${question.slug}`}>
                      {excerpt(question.questionText, 120)}
                    </Link>
                    <div className="feed-tags">
                      <Link className="topic-chip dense" to={`/questions?subject=${question.subject.slug}`}>
                        {question.subject.name}
                      </Link>
                      <span className="topic-chip dense subtle">{question.session}</span>
                    </div>
                    <div className="feed-meta">
                      <span>{question.author.name}</span>
                      <span>{formatDateTime(question.createdAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="exchange-sidebar">
          <div className="exchange-side-card accent">
            <img className="exchange-side-logo" src="/mathatlas-logo.png" alt="MathAtlas logo" />
            <div>
              <div className="section-label">MathAtlas</div>
              <h3>One open mathematics web space for theory and problem solving.</h3>
              <p>
                Move from a question to a theorem, then into a counterexample, without breaking the reading
                flow.
              </p>
            </div>
          </div>

          <div className="exchange-side-card">
            <div className="exchange-side-header">
              <div className="section-label">Hot Knowledge Links</div>
              <Link to="/search">Search all</Link>
            </div>
            <div className="sidebar-link-list">
              {activityItems.map((item) => (
                <Link className="sidebar-link-item" key={item.key} to={item.href}>
                  <span className="sidebar-link-type">{item.label}</span>
                  <strong>{item.title}</strong>
                </Link>
              ))}
            </div>
          </div>

          <div className="exchange-side-card">
            <div className="section-label">Knowledge Snapshot</div>
            <div className="sidebar-stat-list">
              <div className="sidebar-stat-item">
                <strong>{data.stats.questionCount}</strong>
                <span>Questions</span>
              </div>
              <div className="sidebar-stat-item">
                <strong>{data.stats.conceptCount}</strong>
                <span>Theory nodes</span>
              </div>
              <div className="sidebar-stat-item">
                <strong>{data.stats.counterexampleCount}</strong>
                <span>Counterexamples</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid-two">
        <article className="content-card">
          <div className="section-label">Recent Theory Nodes</div>
          <div className="stack-list">
            {data.recentConcepts.map((concept) => (
              <Link key={concept.id} className="list-link-card" to={`/concepts/${concept.slug}`}>
                <strong>
                  {concept.type} - {concept.title}
                </strong>
                <span>{excerpt(concept.content, 140)}</span>
                <small>
                  {concept.author.name} - {formatDateTime(concept.createdAt)}
                </small>
              </Link>
            ))}
          </div>
        </article>

        <article className="content-card">
          <div className="section-label">Featured Counterexamples</div>
          <div className="stack-list">
            {data.recentCounterexamples.map((counterexample) => (
              <Link
                key={counterexample.id}
                className="list-link-card warm"
                to={`/counterexamples/${counterexample.slug}`}
              >
                <strong>COUNTEREXAMPLE - {counterexample.title}</strong>
                <span>{excerpt(counterexample.explanation, 140)}</span>
                <small>
                  {counterexample.author.name} - {formatDateTime(counterexample.createdAt)}
                </small>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
