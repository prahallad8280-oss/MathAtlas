import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { QuestionCard } from "../components/QuestionCard";
import type { Question } from "../types";

export function SubjectsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const payload = await apiRequest<Question[]>("/questions");
        setQuestions(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load subjects.");
      }
    }

    void loadQuestions();
  }, []);

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="empty-state">Loading subject-wise question groups...</div>;
  }

  const grouped = questions.reduce<Record<string, Question[]>>((accumulator, question) => {
    const key = question.subject.name;
    accumulator[key] = accumulator[key] ? [...accumulator[key], question] : [question];
    return accumulator;
  }, {});

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Subject-Wise View</div>
          <h2>One question dataset, regrouped by mathematical subject.</h2>
        </div>
      </section>

      {Object.entries(grouped)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([subjectName, subjectQuestions]) => (
          <section key={subjectName} className="group-section">
            <div className="group-heading">
              <h3>{subjectName}</h3>
              <span>{subjectQuestions.length} questions</span>
            </div>
            <div className="stack-list">
              {subjectQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
