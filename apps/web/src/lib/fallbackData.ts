import type { Concept, Counterexample, DashboardPayload, Question, SearchResult, Subject } from "../types";

export const fallbackSubjects: Subject[] = [
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

export const fallbackQuestions: Question[] = [
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
    solution: {
      id: "fallback-rank-solution",
      content: "Use the rank-nullity theorem: rank(A) + nullity(A) equals the dimension of the domain.",
      createdAt: "2025-04-15T00:00:00.000Z",
      updatedAt: "2025-04-15T00:00:00.000Z",
    },
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
    solution: {
      id: "fallback-evt-solution",
      content: "A continuous function on a compact set attains both maximum and minimum values.",
      createdAt: "2025-04-10T00:00:00.000Z",
      updatedAt: "2025-04-10T00:00:00.000Z",
    },
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
    solution: {
      id: "fallback-normal-solution",
      content: "Check whether gNg^{-1} = N for every group element g.",
      createdAt: "2025-04-05T00:00:00.000Z",
      updatedAt: "2025-04-05T00:00:00.000Z",
    },
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
    solution: {
      id: "fallback-compactness-solution",
      content: "In metric spaces, compactness is equivalent to sequential compactness.",
      createdAt: "2025-04-01T00:00:00.000Z",
      updatedAt: "2025-04-01T00:00:00.000Z",
    },
  },
];

export const fallbackConcepts: Concept[] = [
  {
    id: "fallback-theorem",
    title: "Extreme Value Theorem",
    slug: "extreme-value-theorem",
    content: "A continuous real-valued function on a compact set attains its maximum and minimum.",
    type: "THEOREM",
    createdAt: "2025-04-15T00:00:00.000Z",
    updatedAt: "2025-04-15T00:00:00.000Z",
    author: { id: "fallback-author", name: "MathAtlas" },
    _count: { relatedCounters: 1 },
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
    _count: { relatedCounters: 1 },
  },
  {
    id: "fallback-result",
    title: "Rank Nullity Theorem",
    slug: "rank-nullity-theorem",
    content: "For a linear map T: V to W, dim(V) = rank(T) + nullity(T).",
    type: "RESULT",
    createdAt: "2025-04-08T00:00:00.000Z",
    updatedAt: "2025-04-08T00:00:00.000Z",
    author: { id: "fallback-author", name: "MathAtlas" },
    _count: { relatedCounters: 0 },
  },
];

export const fallbackCounterexamples: Counterexample[] = [
  {
    id: "fallback-counterexample-open",
    title: "Continuous image need not preserve openness",
    slug: "continuous-image-need-not-preserve-openness",
    explanation: "A continuous map can fail to preserve openness when hypotheses are weakened.",
    createdAt: "2025-04-12T00:00:00.000Z",
    updatedAt: "2025-04-12T00:00:00.000Z",
    author: { id: "fallback-author", name: "MathAtlas" },
    relatedConcepts: [fallbackConcepts[1]],
  },
  {
    id: "fallback-counterexample-compact",
    title: "Closed and bounded is not compact in every metric space",
    slug: "closed-bounded-not-compact",
    explanation: "The Heine-Borel theorem is special to Euclidean spaces and does not hold in every metric space.",
    createdAt: "2025-04-09T00:00:00.000Z",
    updatedAt: "2025-04-09T00:00:00.000Z",
    author: { id: "fallback-author", name: "MathAtlas" },
    relatedConcepts: [fallbackConcepts[1]],
  },
  {
    id: "fallback-counterexample-series",
    title: "Pointwise convergence need not preserve continuity",
    slug: "pointwise-convergence-continuity",
    explanation: "A sequence of continuous functions may converge pointwise to a discontinuous function.",
    createdAt: "2025-04-06T00:00:00.000Z",
    updatedAt: "2025-04-06T00:00:00.000Z",
    author: { id: "fallback-author", name: "MathAtlas" },
    relatedConcepts: [fallbackConcepts[0]],
  },
];

export const fallbackDashboard: DashboardPayload = {
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
  recentQuestions: fallbackQuestions,
  recentConcepts: fallbackConcepts,
  recentCounterexamples: fallbackCounterexamples,
};

export const fallbackSearchResults: SearchResult[] = [
  {
    type: "QUESTION",
    title: "Rank of a matrix",
    href: "/questions/rank-of-a-matrix",
    excerpt: "A sample linear algebra question from the fallback MathAtlas preview dataset.",
  },
  {
    type: "THEOREM",
    title: "Extreme Value Theorem",
    href: "/concepts/extreme-value-theorem",
    excerpt: "A continuous real-valued function on a compact set attains its maximum and minimum.",
  },
  {
    type: "COUNTEREXAMPLE",
    title: "Continuous image need not preserve openness",
    href: "/counterexamples/continuous-image-need-not-preserve-openness",
    excerpt: "A continuous map can fail to preserve openness when hypotheses are weakened.",
  },
];
