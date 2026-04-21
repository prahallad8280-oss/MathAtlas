export type Role = "ADMIN" | "AUTHOR";
export type ExamSession = "JUNE" | "DECEMBER";
export type ConceptType = "THEOREM" | "DEFINITION" | "RESULT";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
};

export type SiteStats = {
  visitorViewCount: number;
};

export type Subject = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    questions: number;
  };
};

export type Question = {
  id: string;
  slug: string;
  questionText: string;
  year: number;
  session: ExamSession;
  createdAt: string;
  updatedAt: string;
  subject: Subject;
  author: {
    id: string;
    name: string;
    role?: Role;
  };
  solution?: {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author?: {
      id: string;
      name: string;
    };
  };
};

export type LinkedItem = {
  title: string;
  kind: "concept" | "counterexample" | "unresolved";
  label: string;
  href: string | null;
};

export type QuestionDetail = Question & {
  linkedItems: LinkedItem[];
};

export type Concept = {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: ConceptType;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    role?: Role;
  };
  relatedCounters?: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
  _count?: {
    relatedCounters: number;
  };
};

export type ConceptDetail = Concept & {
  linkedItems: LinkedItem[];
};

export type Counterexample = {
  id: string;
  title: string;
  slug: string;
  explanation: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    role?: Role;
  };
  relatedConcepts?: Array<{
    id: string;
    title: string;
    slug: string;
    type: ConceptType;
  }>;
};

export type CounterexampleDetail = Counterexample & {
  linkedItems: LinkedItem[];
};

export type SearchResult = {
  type: string;
  title: string;
  href: string;
  excerpt: string;
};

export type DashboardPayload = {
  stats: {
    questionCount: number;
    solutionCount: number;
    conceptCount: number;
    theoremCount: number;
    definitionCount: number;
    resultCount: number;
    counterexampleCount: number;
    subjectCount: number;
  };
  recentQuestions: Question[];
  recentConcepts: Concept[];
  recentCounterexamples: Counterexample[];
};

export type KnowledgeIndexItem = {
  title: string;
  href: string;
  type: string;
};
