import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { QuestionCard } from "../components/QuestionCard";
import type { Question } from "../types";
import { fallbackQuestions } from "../lib/fallbackData";

export function YearsPage() {
  const [questions, setQuestions] = useState<Question[]>(fallbackQuestions);
  const [isLoadingLiveContent, setIsLoadingLiveContent] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setQuestions(fallbackQuestions);
        setIsLoadingLiveContent(true);
        const payload = await apiRequest<Question[]>("/questions");
        setQuestions(payload);
      } catch (loadError) {
        console.warn("Using fallback year groups", loadError);
        setQuestions(fallbackQuestions);
      } finally {
        setIsLoadingLiveContent(false);
      }
    }

    void loadQuestions();
  }, []);

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
