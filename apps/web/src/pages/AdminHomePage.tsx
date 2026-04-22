import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, apiRequest } from "../lib/api";
import { useAuth } from "../lib/auth";
import { excerpt, formatDateTime } from "../lib/format";
import type { DashboardPayload } from "../types";

export function AdminHomePage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const payload = await apiRequest<DashboardPayload>("/meta/dashboard");
        setData(payload);
        setError(null);
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 503) {
          setError("The Render backend is waking up. Refresh again in a few seconds.");
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load admin dashboard.");
      }
    }

    void loadDashboard();
  }, []);

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (!data) {
    return <div className="empty-state">Loading admin workspace...</div>;
  }

  const firstName = (user?.name ?? "there").split(" ")[0];

  return (
    <div className="page-stack">
      <section className="admin-hero-card">
        <div>
          <div className="eyebrow">{user?.role === "ADMIN" ? "Admin Home" : "Author Home"}</div>
          <h2>Welcome back, {firstName}.</h2>
          <p>
            Public visitors can read MathAtlas freely. This private area is reserved for admins and authors
            who maintain the question bank and mathematical knowledge base.
          </p>
        </div>

        <div className="hero-actions">
          <Link className="primary-button" to="/admin/content">
            Open Content Studio
          </Link>
          <Link className="ghost-button" to="/">
            View Public Home
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total Questions</span>
          <strong>{data.stats.questionCount}</strong>
        </article>
        <article className="stat-card">
          <span>Total Concepts</span>
          <strong>{data.stats.conceptCount}</strong>
        </article>
        <article className="stat-card">
          <span>Total Counterexamples</span>
          <strong>{data.stats.counterexampleCount}</strong>
        </article>
      </section>

      <section className="card-grid">
        <Link className="admin-action-card" to="/admin/content">
          <strong>Question and Theory Management</strong>
          <span>Create, edit, and delete questions, solutions, theorems, definitions, results, and counterexamples.</span>
        </Link>
        <Link className="admin-action-card" to="/questions">
          <strong>Public Question Bank</strong>
          <span>Check exactly what public users see in the question listings and detail pages.</span>
        </Link>
        <Link className="admin-action-card" to="/search">
          <strong>Search the Knowledge Graph</strong>
          <span>Test internal links, theorem references, and cross-page navigation from the live search results.</span>
        </Link>
        <Link className="admin-action-card" to="/">
          <strong>Return to Public Home</strong>
          <span>Go back to the public landing page without logging out of the admin workspace.</span>
        </Link>
      </section>

      <section className="grid-two">
        <article className="content-card">
          <div className="section-label">Recent Questions</div>
          <div className="stack-list">
            {data.recentQuestions.map((question) => (
              <Link key={question.id} className="list-link-card" to={`/questions/${question.slug}`}>
                <strong>
                  {question.year} {question.session} - {question.subject.name}
                </strong>
                <span>{excerpt(question.questionText, 150)}</span>
                <small>
                  {question.author.name} - {formatDateTime(question.createdAt)}
                </small>
              </Link>
            ))}
          </div>
        </article>

        <article className="content-card">
          <div className="section-label">Recent Theory and Counterexamples</div>
          <div className="stack-list">
            {data.recentConcepts.map((concept) => (
              <Link key={concept.id} className="list-link-card" to={`/concepts/${concept.slug}`}>
                <strong>
                  {concept.type} - {concept.title}
                </strong>
                <span>{excerpt(concept.content, 150)}</span>
                <small>
                  {concept.author.name} - {formatDateTime(concept.createdAt)}
                </small>
              </Link>
            ))}

            {data.recentCounterexamples.map((counterexample) => (
              <Link
                key={counterexample.id}
                className="list-link-card warm"
                to={`/counterexamples/${counterexample.slug}`}
              >
                <strong>COUNTEREXAMPLE - {counterexample.title}</strong>
                <span>{excerpt(counterexample.explanation, 150)}</span>
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
