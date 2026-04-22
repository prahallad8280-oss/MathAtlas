import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { QuestionCard } from "../components/QuestionCard";
import type { Question } from "../types";
import { fallbackQuestions } from "../lib/fallbackData";

export function YearsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const payload = await apiRequest<Question[]>("/questions");
        setQuestions(payload);
        setIsUsingFallback(false);
      } catch (loadError) {
        console.warn("Using fallback year groups", loadError);
        setQuestions(fallbackQuestions);
        setIsUsingFallback(true);
      }
    }

    void loadQuestions();
  }, []);

  if (questions.length === 0) {
    return <div className="empty-state">Loading year-wise question groups...</div>;
  }

  const grouped = questions.reduce<Record<string, Question[]>>((accumulator, question) => {
    const key = `${question.year} ${question.session}`;
    accumulator[key] = accumulator[key] ? [...accumulator[key], question] : [question];
    return accumulator;
  }, {});

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Year-Wise View</div>
          <h2>The same questions reappear through exam chronology without duplication in storage.</h2>
        </div>
      </section>

      {isUsingFallback ? (
        <div className="home-fallback-note">Live API data is temporarily unavailable. Showing preview year groups.</div>
      ) : null}

      {Object.entries(grouped).map(([label, items]) => (
        <section key={label} className="group-section">
          <div className="group-heading">
            <h3>{label}</h3>
            <span>{items.length} questions</span>
          </div>
          <div className="stack-list">
            {items.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
