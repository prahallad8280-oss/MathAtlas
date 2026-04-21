import { useState } from "react";
import { Link } from "react-router-dom";
import type { Question } from "../types";
import { MarkdownContent } from "./MarkdownContent";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function QuestionCard({ question }: { question: Question }) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <article className="content-card question-card">
      <div className="content-meta-row">
        <span className="pill">{question.subject.name}</span>
        <span className="pill alt">
          {question.year} {question.session}
        </span>
      </div>

      <div className="markdown-content compact">
        <MarkdownContent content={question.questionText} />
      </div>

      <div className="metadata">
        <span>Author: {question.author.name}</span>
        <span>Created: {formatDate(question.createdAt)}</span>
      </div>

      <div className="button-row">
        <button className="primary-button" onClick={() => setShowSolution((value) => !value)}>
          {showSolution ? "Hide Solution" : "View Solution"}
        </button>
        <Link className="ghost-button" to={`/questions/${question.slug}`}>
          Open Question Page
        </Link>
      </div>

      {showSolution && question.solution ? (
        <div className="solution-panel">
          <div className="section-label">Detailed Solution</div>
          <MarkdownContent content={question.solution.content} />
        </div>
      ) : null}
    </article>
  );
}
