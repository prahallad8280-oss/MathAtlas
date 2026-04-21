import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { QuestionCard } from "../components/QuestionCard";
import type { ExamSession, Question, Subject } from "../types";

type YearGroup = {
  year: number;
  session: ExamSession;
  _count: {
    _all: number;
  };
};

export function QuestionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [years, setYears] = useState<YearGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const q = searchParams.get("q") ?? "";
  const subject = searchParams.get("subject") ?? "";
  const year = searchParams.get("year") ?? "";
  const session = searchParams.get("session") ?? "";

  useEffect(() => {
    async function loadQuestions() {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (subject) params.set("subject", subject);
        if (year) params.set("year", year);
        if (session) params.set("session", session);

        const [questionData, subjectData, yearData] = await Promise.all([
          apiRequest<Question[]>(`/questions${params.toString() ? `?${params.toString()}` : ""}`),
          apiRequest<Subject[]>("/meta/subjects"),
          apiRequest<YearGroup[]>("/meta/years"),
        ]);

        setQuestions(questionData);
        setSubjects(subjectData);
        setYears(yearData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load questions.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadQuestions();
  }, [q, subject, year, session]);

  function updateFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }

    setSearchParams(next);
  }

  const yearOptions = [...new Set(years.map((item) => item.year))];

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Question Bank</div>
          <h2>Filter questions by subject, year, and exam session.</h2>
        </div>
      </section>

      <section className="filter-bar">
        <input
          value={q}
          onChange={(event) => updateFilter("q", event.target.value)}
          placeholder="Search by text, solution, or author"
        />
        <select value={subject} onChange={(event) => updateFilter("subject", event.target.value)}>
          <option value="">All subjects</option>
          {subjects.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select value={year} onChange={(event) => updateFilter("year", event.target.value)}>
          <option value="">All years</option>
          {yearOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select value={session} onChange={(event) => updateFilter("session", event.target.value)}>
          <option value="">All sessions</option>
          <option value="JUNE">June</option>
          <option value="DECEMBER">December</option>
        </select>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}
      {isLoading ? <div className="empty-state">Loading questions...</div> : null}
      {!isLoading && questions.length === 0 ? (
        <div className="empty-state">No questions matched the current filters.</div>
      ) : null}

      <section className="stack-list">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </section>
    </div>
  );
}
