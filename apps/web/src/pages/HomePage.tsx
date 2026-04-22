import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { excerpt } from "../lib/format";
import type { DashboardPayload, Subject } from "../types";

type SubjectAccent = {
  icon: string;
  tone: string;
  description: string;
};

const subjectAccents: Record<string, SubjectAccent> = {
  "real-analysis": {
    icon: "int",
    tone: "blue",
    description: "Sequences, limits, continuity, differentiation, and measure ideas.",
  },
  "linear-algebra": {
    icon: "grid",
    tone: "green",
    description: "Matrices, vector spaces, linear maps, and spectral viewpoints.",
  },
  "abstract-algebra": {
    icon: "alg",
    tone: "purple",
    description: "Groups, rings, fields, homomorphisms, and algebraic structure.",
  },
  topology: {
    icon: "top",
    tone: "orange",
    description: "Metric spaces, connectedness, compactness, and continuity.",
  },
  "ordinary-differential-equations": {
    icon: "d/dx",
    tone: "teal",
    description: "First order systems, qualitative behavior, and solvable models.",
  },
};

const fallbackSubjects: Subject[] = [
  {
    id: "fallback-real-analysis",
    name: "Real Analysis",
    slug: "real-analysis",
    _count: { questions: 125 },
  },
  {
    id: "fallback-linear-algebra",
    name: "Linear Algebra",
    slug: "linear-algebra",
    _count: { questions: 95 },
  },
  {
    id: "fallback-abstract-algebra",
    name: "Abstract Algebra",
    slug: "abstract-algebra",
    _count: { questions: 65 },
  },
  {
    id: "fallback-topology",
    name: "Topology",
    slug: "topology",
    _count: { questions: 55 },
  },
  {
    id: "fallback-ordinary-differential-equations",
    name: "Ordinary Differential Equations",
    slug: "ordinary-differential-equations",
    _count: { questions: 40 },
  },
];

const fallbackDashboard: DashboardPayload = {
  stats: {
    questionCount: 450,
    solutionCount: 120,
    conceptCount: 180,
    theoremCount: 80,
    definitionCount: 100,
    resultCount: 40,
    counterexampleCount: 50,
    subjectCount: fallbackSubjects.length,
  },
  recentQuestions: [
    {
      id: "fallback-rank-matrix",
      slug: "rank-of-a-matrix",
      questionText: "Rank of a matrix and dimension of its null space.",
      year: 2023,
      session: "DECEMBER",
      createdAt: "2025-04-15T00:00:00.000Z",
      updatedAt: "2025-04-15T00:00:00.000Z",
      subject: fallbackSubjects[1],
      author: { id: "fallback-author", name: "MathAtlas" },
    },
    {
      id: "fallback-evt",
      slug: "extreme-value-theorem",
      questionText: "Extreme Value Theorem and compactness in real analysis.",
      year: 2024,
      session: "JUNE",
      createdAt: "2025-04-10T00:00:00.000Z",
      updatedAt: "2025-04-10T00:00:00.000Z",
      subject: fallbackSubjects[0],
      author: { id: "fallback-author", name: "MathAtlas" },
    },
    {
      id: "fallback-normal-subgroups",
      slug: "normal-subgroups",
      questionText: "Normal subgroups and quotient group structure.",
      year: 2022,
      session: "DECEMBER",
      createdAt: "2025-04-05T00:00:00.000Z",
      updatedAt: "2025-04-05T00:00:00.000Z",
      subject: fallbackSubjects[2],
      author: { id: "fallback-author", name: "MathAtlas" },
    },
    {
      id: "fallback-compactness",
      slug: "compactness-in-metric-spaces",
      questionText: "Compactness in metric spaces and sequential compactness.",
      year: 2023,
      session: "JUNE",
      createdAt: "2025-04-01T00:00:00.000Z",
      updatedAt: "2025-04-01T00:00:00.000Z",
      subject: fallbackSubjects[3],
      author: { id: "fallback-author", name: "MathAtlas" },
    },
  ],
  recentConcepts: [
    {
      id: "fallback-theorem",
      title: "Extreme Value Theorem",
      slug: "extreme-value-theorem",
      content: "A continuous real-valued function on a compact set attains its maximum and minimum.",
      type: "THEOREM",
      createdAt: "2025-04-15T00:00:00.000Z",
      updatedAt: "2025-04-15T00:00:00.000Z",
      author: { id: "fallback-author", name: "MathAtlas" },
    },
    {
      id: "fallback-definition",
      title: "Compact Set",
      slug: "compact-set",
      content: "A compact set is one for which every open cover has a finite subcover.",
      type: "DEFINITION",
      createdAt: "2025-04-10T00:00:00.000Z",
      updatedAt: "2025-04-10T00:00:00.000Z",
      author: { id: "fallback-author", name: "MathAtlas" },
    },
  ],
  recentCounterexamples: [
    {
      id: "fallback-counterexample",
      title: "Continuous image need not preserve openness",
      slug: "continuous-image-need-not-preserve-openness",
      explanation: "A continuous map can fail to preserve openness when hypotheses are weakened.",
      createdAt: "2025-04-12T00:00:00.000Z",
      updatedAt: "2025-04-12T00:00:00.000Z",
      author: { id: "fallback-author", name: "MathAtlas" },
    },
  ],
};

function getSubjectAccent(subject: Subject): SubjectAccent {
  return (
    subjectAccents[subject.slug] ?? {
      icon: "sum",
      tone: "blue",
      description: "Conceptual practice, past-year questions, and linked mathematics.",
    }
  );
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function HomePage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [dashboardPayload, subjectsPayload] = await Promise.all([
          apiRequest<DashboardPayload>("/meta/dashboard"),
          apiRequest<Subject[]>("/meta/subjects"),
        ]);

        setData(dashboardPayload);
        setSubjects(subjectsPayload);
      } catch (loadError) {
        console.warn("Using fallback home content", loadError);
        setData(fallbackDashboard);
        setSubjects(fallbackSubjects);
        setIsUsingFallback(true);
      }
    }

    void loadHomeData();
  }, []);

  if (!data) {
    return <div className="empty-state">Loading the mathematical atlas...</div>;
  }

  const featuredSubjects = (subjects.length > 0 ? subjects : fallbackSubjects)
    .sort((left, right) => (right._count?.questions ?? 0) - (left._count?.questions ?? 0))
    .slice(0, 5);

  const fallbackBooks = ["Real Analysis", "Linear Algebra", "Abstract Algebra", "Topology"];
  const heroBooks = [...featuredSubjects.map((subject) => subject.name), ...fallbackBooks].slice(0, 4);

  const readingItems = [
    ...data.recentConcepts.map((concept) => ({
      id: `concept-${concept.id}`,
      href: `/concepts/${concept.slug}`,
      title: concept.title,
      type: concept.type,
      excerpt: excerpt(concept.content, 96),
      createdAt: concept.createdAt,
    })),
    ...data.recentCounterexamples.map((counterexample) => ({
      id: `counterexample-${counterexample.id}`,
      href: `/counterexamples/${counterexample.slug}`,
      title: counterexample.title,
      type: "COUNTEREXAMPLE",
      excerpt: excerpt(counterexample.explanation, 96),
      createdAt: counterexample.createdAt,
    })),
  ]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 3);

  const statCards = [
    { label: "Questions", value: data.stats.questionCount, icon: "?", tone: "blue" },
    { label: "Solutions", value: data.stats.solutionCount, icon: "[]", tone: "slate" },
    { label: "Theorems", value: data.stats.theoremCount, icon: "sum", tone: "blue" },
    { label: "Counterexamples", value: data.stats.counterexampleCount, icon: "!", tone: "gold" },
  ];

  const exploreItems = [
    {
      title: "Theorems",
      value: data.stats.theoremCount,
      href: "/concepts?type=THEOREM",
      icon: "thm",
      tone: "blue",
    },
    {
      title: "Definitions",
      value: data.stats.definitionCount,
      href: "/concepts?type=DEFINITION",
      icon: "def",
      tone: "green",
    },
    {
      title: "Results",
      value: data.stats.resultCount,
      href: "/concepts?type=RESULT",
      icon: "res",
      tone: "purple",
    },
    {
      title: "Subjects",
      value: data.stats.subjectCount,
      href: "/subjects",
      icon: "#",
      tone: "orange",
    },
  ];

  return (
    <div className="page-stack home-reference-page">
      <section className="home-reference-hero">
        <div className="home-reference-copy">
          <div className="eyebrow">MathAtlas Platform</div>
          <h1>Everything CSIR NET Mathematics, in one place.</h1>
          <p>
            Previous year questions with solutions, important theorems, counterexamples, and definitions
            are all organized and interlinked for better understanding.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" to="/questions">
              Browse Questions
            </Link>
            <Link className="ghost-button" to="/concepts">
              Explore Theorems
            </Link>
          </div>
        </div>

        <div className="home-reference-visual" aria-hidden="true">
          <div className="home-visual-equations">
            <span className="home-equation top">sum 1/n^2 = pi^2/6</span>
            <span className="home-equation middle">int f(x) dx</span>
            <span className="home-equation curve">y = f(x)</span>
          </div>

          <div className="home-book-stack">
            {heroBooks.map((label, index) => (
              <div className={`home-book home-book-${index + 1}`} key={`${label}-${index}`}>
                {label.toUpperCase()}
              </div>
            ))}
          </div>

          <img className="home-visual-logo" src="/mathatlas-logo.png" alt="" />
        </div>
      </section>

      {isUsingFallback ? (
        <div className="home-fallback-note">
          Live database content is warming up. Showing a preview layout while MathAtlas reconnects.
        </div>
      ) : null}

      <section className="home-reference-stats">
        {statCards.map((item) => (
          <div className="home-stat-card" key={item.label}>
            <span className={`home-stat-icon ${item.tone}`}>{item.icon}</span>
            <div>
              <strong>{formatCount(item.value)}+</strong>
              <span>{item.label}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="home-reference-section">
        <div className="home-section-header">
          <div>
            <h2>Browse by Subject</h2>
            <p>Jump into the biggest question clusters across the CSIR NET mathematics syllabus.</p>
          </div>
          <Link className="home-inline-link" to="/subjects">
            View all subjects
          </Link>
        </div>

        <div className="home-subject-grid">
          {featuredSubjects.map((subject) => {
            const accent = getSubjectAccent(subject);

            return (
              <Link className={`home-subject-card ${accent.tone}`} key={subject.id} to={`/questions?subject=${subject.slug}`}>
                <div className="home-subject-icon">{accent.icon}</div>
                <h3>{subject.name}</h3>
                <p>{accent.description}</p>
                <strong>{formatCount(subject._count?.questions ?? 0)}+ Questions</strong>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="home-reference-columns">
        <article className="home-panel">
          <div className="home-panel-header">
            <h3>Newest Questions</h3>
            <Link className="home-inline-link" to="/questions">
              View all
            </Link>
          </div>

          <div className="home-question-list">
            {data.recentQuestions.slice(0, 4).map((question) => (
              <Link className="home-question-item" key={question.id} to={`/questions/${question.slug}`}>
                <div className="home-question-icon">[]</div>
                <div className="home-question-copy">
                  <strong>{excerpt(question.questionText, 72)}</strong>
                  <span>
                    CSIR NET {question.session === "JUNE" ? "June" : "December"} {question.year}
                  </span>
                </div>
                <span className="home-question-tag">{question.subject.name}</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="home-panel">
          <div className="home-panel-header">
            <h3>Explore More</h3>
          </div>

          <div className="home-more-grid">
            {exploreItems.map((item) => (
              <Link className={`home-more-card ${item.tone}`} key={item.title} to={item.href}>
                <span className="home-more-icon">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <span>{formatCount(item.value)}+</span>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="home-panel">
          <div className="home-panel-header">
            <h3>From the Atlas</h3>
            <Link className="home-inline-link" to="/search">
              View all
            </Link>
          </div>

          <div className="home-reading-list">
            {readingItems.map((item, index) => (
              <Link className="home-reading-item" key={item.id} to={item.href}>
                <div className={`home-reading-thumb tone-${(index % 3) + 1}`}>
                  <span>{item.type}</span>
                </div>
                <div className="home-reading-copy">
                  <strong>{item.title}</strong>
                  <span>{formatShortDate(item.createdAt)}</span>
                  <p>{item.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
