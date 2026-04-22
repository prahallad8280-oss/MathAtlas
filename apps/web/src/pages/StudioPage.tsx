import { useEffect, useState } from "react";
import { ApiError, apiRequest } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDateTime, excerpt } from "../lib/format";
import { useKnowledge } from "../lib/knowledge";
import type { Concept, ConceptType, Counterexample, ExamSession, Question } from "../types";

type TabKey = "questions" | "concepts" | "counterexamples";

const tabLabels: Record<TabKey, string> = {
  questions: "Questions",
  concepts: "Concepts",
  counterexamples: "Counterexamples",
};

const emptyQuestionForm = {
  questionText: "",
  year: `${new Date().getFullYear()}`,
  session: "JUNE" as ExamSession,
  subjectName: "",
  solutionContent: "",
};

const emptyConceptForm = {
  title: "",
  type: "THEOREM" as ConceptType,
  content: "",
};

const emptyCounterexampleForm = {
  title: "",
  explanation: "",
  relatedConceptIds: [] as string[],
};

export function StudioPage() {
  const { token, user } = useAuth();
  const { reload } = useKnowledge();
  const [tab, setTab] = useState<TabKey>("questions");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [counterexamples, setCounterexamples] = useState<Counterexample[]>([]);
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm);
  const [conceptForm, setConceptForm] = useState(emptyConceptForm);
  const [counterexampleForm, setCounterexampleForm] = useState(emptyCounterexampleForm);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingConceptId, setEditingConceptId] = useState<string | null>(null);
  const [editingCounterexampleId, setEditingCounterexampleId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadStudioData() {
    if (!token) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [questionData, conceptData, counterexampleData] = await Promise.all([
        apiRequest<Question[]>("/questions", { token }),
        apiRequest<Concept[]>("/concepts", { token }),
        apiRequest<Counterexample[]>("/counterexamples", { token }),
      ]);

      setQuestions(questionData);
      setConcepts(conceptData);
      setCounterexamples(counterexampleData);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 503) {
        setError("The Render backend is waking up. Refresh again in a few seconds.");
      } else {
      setError(loadError instanceof Error ? loadError.message : "Unable to load studio content.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadStudioData();
  }, [token]);

  function canManage(authorId: string) {
    return user?.role === "ADMIN" || user?.id === authorId;
  }

  async function submitQuestion() {
    if (!token) return;

    const method = editingQuestionId ? "PUT" : "POST";
    const path = editingQuestionId ? `/questions/${editingQuestionId}` : "/questions";

    await apiRequest(path, {
      method,
      token,
      body: JSON.stringify({
        questionText: questionForm.questionText,
        year: Number(questionForm.year),
        session: questionForm.session,
        subjectName: questionForm.subjectName,
        solutionContent: questionForm.solutionContent,
      }),
    });

    setQuestionForm(emptyQuestionForm);
    setEditingQuestionId(null);
  }

  async function submitConcept() {
    if (!token) return;

    const method = editingConceptId ? "PUT" : "POST";
    const path = editingConceptId ? `/concepts/${editingConceptId}` : "/concepts";

    await apiRequest(path, {
      method,
      token,
      body: JSON.stringify(conceptForm),
    });

    setConceptForm(emptyConceptForm);
    setEditingConceptId(null);
  }

  async function submitCounterexample() {
    if (!token) return;

    const method = editingCounterexampleId ? "PUT" : "POST";
    const path = editingCounterexampleId ? `/counterexamples/${editingCounterexampleId}` : "/counterexamples";

    await apiRequest(path, {
      method,
      token,
      body: JSON.stringify(counterexampleForm),
    });

    setCounterexampleForm(emptyCounterexampleForm);
    setEditingCounterexampleId(null);
  }

  async function handleSave(currentTab: TabKey) {
    try {
      setError(null);
      setMessage(null);

      if (currentTab === "questions") {
        await submitQuestion();
      }

      if (currentTab === "concepts") {
        await submitConcept();
      }

      if (currentTab === "counterexamples") {
        await submitCounterexample();
      }

      await loadStudioData();
      await reload();
      setMessage("Content saved successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save content.");
    }
  }

  async function handleDelete(path: string) {
    if (!token || !window.confirm("Delete this entry permanently?")) {
      return;
    }

    try {
      setError(null);
      setMessage(null);
      await apiRequest(path, { method: "DELETE", token });
      await loadStudioData();
      await reload();
      setMessage("Content deleted successfully.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete content.");
    }
  }

  if (isLoading) {
    return <div className="empty-state">Loading author studio...</div>;
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Content Studio</div>
          <h2>Create, edit, and delete questions, solutions, theorems, definitions, and counterexamples.</h2>
        </div>
      </section>

      {message ? <div className="success-banner">{message}</div> : null}
      {error ? <div className="error-banner">{error}</div> : null}

      <div className="tab-row">
        {(["questions", "concepts", "counterexamples"] as TabKey[]).map((item) => (
          <button
            key={item}
            className={tab === item ? "tab-button active" : "tab-button"}
            onClick={() => setTab(item)}
          >
            {tabLabels[item]}
          </button>
        ))}
      </div>

      {tab === "questions" ? (
        <div className="studio-grid">
          <article className="detail-card">
            <div className="section-label">{editingQuestionId ? "Edit Question" : "Add Question"}</div>
            <div className="stack-form">
              <label>
                Question Text
                <textarea
                  rows={6}
                  value={questionForm.questionText}
                  onChange={(event) =>
                    setQuestionForm((current) => ({ ...current, questionText: event.target.value }))
                  }
                />
              </label>
              <div className="inline-grid">
                <label>
                  Year
                  <input
                    value={questionForm.year}
                    onChange={(event) => setQuestionForm((current) => ({ ...current, year: event.target.value }))}
                  />
                </label>
                <label>
                  Session
                  <select
                    value={questionForm.session}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        session: event.target.value as ExamSession,
                      }))
                    }
                  >
                    <option value="JUNE">June</option>
                    <option value="DECEMBER">December</option>
                  </select>
                </label>
              </div>
              <label>
                Subject
                <input
                  value={questionForm.subjectName}
                  onChange={(event) =>
                    setQuestionForm((current) => ({ ...current, subjectName: event.target.value }))
                  }
                />
              </label>
              <label>
                Detailed Solution
                <textarea
                  rows={8}
                  value={questionForm.solutionContent}
                  onChange={(event) =>
                    setQuestionForm((current) => ({ ...current, solutionContent: event.target.value }))
                  }
                />
              </label>
              <div className="button-row">
                <button className="primary-button" onClick={() => void handleSave("questions")}>
                  {editingQuestionId ? "Update Question" : "Create Question"}
                </button>
                <button
                  className="ghost-button"
                  onClick={() => {
                    setQuestionForm(emptyQuestionForm);
                    setEditingQuestionId(null);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </article>

          <article className="detail-card">
            <div className="section-label">Existing Questions</div>
            <div className="stack-list">
              {questions.map((question) => (
                <div className="admin-list-card" key={question.id}>
                  <strong>
                    {question.year} {question.session} • {question.subject.name}
                  </strong>
                  <span>{excerpt(question.questionText, 150)}</span>
                  <small>
                    {question.author.name} • {formatDateTime(question.createdAt)}
                  </small>
                  {canManage(question.author.id) ? (
                    <div className="button-row">
                      <button
                        className="ghost-button"
                        onClick={() => {
                          setEditingQuestionId(question.id);
                          setQuestionForm({
                            questionText: question.questionText,
                            year: `${question.year}`,
                            session: question.session,
                            subjectName: question.subject.name,
                            solutionContent: question.solution?.content ?? "",
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button className="text-button danger" onClick={() => void handleDelete(`/questions/${question.id}`)}>
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}

      {tab === "concepts" ? (
        <div className="studio-grid">
          <article className="detail-card">
            <div className="section-label">{editingConceptId ? "Edit Concept" : "Add Concept"}</div>
            <div className="stack-form">
              <label>
                Title
                <input
                  value={conceptForm.title}
                  onChange={(event) => setConceptForm((current) => ({ ...current, title: event.target.value }))}
                />
              </label>
              <label>
                Type
                <select
                  value={conceptForm.type}
                  onChange={(event) =>
                    setConceptForm((current) => ({ ...current, type: event.target.value as ConceptType }))
                  }
                >
                  <option value="THEOREM">THEOREM</option>
                  <option value="DEFINITION">DEFINITION</option>
                  <option value="RESULT">RESULT</option>
                </select>
              </label>
              <label>
                Content
                <textarea
                  rows={10}
                  value={conceptForm.content}
                  onChange={(event) => setConceptForm((current) => ({ ...current, content: event.target.value }))}
                />
              </label>
              <div className="button-row">
                <button className="primary-button" onClick={() => void handleSave("concepts")}>
                  {editingConceptId ? "Update Concept" : "Create Concept"}
                </button>
                <button
                  className="ghost-button"
                  onClick={() => {
                    setConceptForm(emptyConceptForm);
                    setEditingConceptId(null);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </article>

          <article className="detail-card">
            <div className="section-label">Existing Concepts</div>
            <div className="stack-list">
              {concepts.map((concept) => (
                <div className="admin-list-card" key={concept.id}>
                  <strong>
                    {concept.type} • {concept.title}
                  </strong>
                  <span>{excerpt(concept.content, 150)}</span>
                  <small>
                    {concept.author.name} • {formatDateTime(concept.createdAt)}
                  </small>
                  {canManage(concept.author.id) ? (
                    <div className="button-row">
                      <button
                        className="ghost-button"
                        onClick={() => {
                          setEditingConceptId(concept.id);
                          setConceptForm({
                            title: concept.title,
                            type: concept.type,
                            content: concept.content,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button className="text-button danger" onClick={() => void handleDelete(`/concepts/${concept.id}`)}>
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}

      {tab === "counterexamples" ? (
        <div className="studio-grid">
          <article className="detail-card">
            <div className="section-label">
              {editingCounterexampleId ? "Edit Counterexample" : "Add Counterexample"}
            </div>
            <div className="stack-form">
              <label>
                Title
                <input
                  value={counterexampleForm.title}
                  onChange={(event) =>
                    setCounterexampleForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </label>
              <label>
                Explanation
                <textarea
                  rows={10}
                  value={counterexampleForm.explanation}
                  onChange={(event) =>
                    setCounterexampleForm((current) => ({
                      ...current,
                      explanation: event.target.value,
                    }))
                  }
                />
              </label>
              <fieldset className="checkbox-fieldset">
                <legend>Link to related concepts</legend>
                <div className="checkbox-grid">
                  {concepts.map((concept) => (
                    <label key={concept.id} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={counterexampleForm.relatedConceptIds.includes(concept.id)}
                        onChange={(event) => {
                          setCounterexampleForm((current) => ({
                            ...current,
                            relatedConceptIds: event.target.checked
                              ? [...current.relatedConceptIds, concept.id]
                              : current.relatedConceptIds.filter((id) => id !== concept.id),
                          }));
                        }}
                      />
                      <span>
                        {concept.type} • {concept.title}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="button-row">
                <button className="primary-button" onClick={() => void handleSave("counterexamples")}>
                  {editingCounterexampleId ? "Update Counterexample" : "Create Counterexample"}
                </button>
                <button
                  className="ghost-button"
                  onClick={() => {
                    setCounterexampleForm(emptyCounterexampleForm);
                    setEditingCounterexampleId(null);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </article>

          <article className="detail-card">
            <div className="section-label">Existing Counterexamples</div>
            <div className="stack-list">
              {counterexamples.map((counterexample) => (
                <div className="admin-list-card" key={counterexample.id}>
                  <strong>{counterexample.title}</strong>
                  <span>{excerpt(counterexample.explanation, 150)}</span>
                  <small>
                    {counterexample.author.name} • {formatDateTime(counterexample.createdAt)}
                  </small>
                  {canManage(counterexample.author.id) ? (
                    <div className="button-row">
                      <button
                        className="ghost-button"
                        onClick={() => {
                          setEditingCounterexampleId(counterexample.id);
                          setCounterexampleForm({
                            title: counterexample.title,
                            explanation: counterexample.explanation,
                            relatedConceptIds: (counterexample.relatedConcepts ?? []).map((item) => item.id),
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-button danger"
                        onClick={() => void handleDelete(`/counterexamples/${counterexample.id}`)}
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}
