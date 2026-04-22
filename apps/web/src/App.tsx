import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminShell } from "./components/AdminShell";
import { PublicShell } from "./components/PublicShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./lib/auth";
import { AdminHomePage } from "./pages/AdminHomePage";
import { HomePage } from "./pages/HomePage";
const QuestionsPage = lazy(() =>
  import("./pages/QuestionsPage").then((module) => ({ default: module.QuestionsPage })),
);
const QuestionDetailPage = lazy(() =>
  import("./pages/QuestionDetailPage").then((module) => ({ default: module.QuestionDetailPage })),
);
const SubjectsPage = lazy(() =>
  import("./pages/SubjectsPage").then((module) => ({ default: module.SubjectsPage })),
);
const YearsPage = lazy(() => import("./pages/YearsPage").then((module) => ({ default: module.YearsPage })));
const ConceptsPage = lazy(() =>
  import("./pages/ConceptsPage").then((module) => ({ default: module.ConceptsPage })),
);
const ConceptDetailPage = lazy(() =>
  import("./pages/ConceptDetailPage").then((module) => ({ default: module.ConceptDetailPage })),
);
const CounterexamplesPage = lazy(() =>
  import("./pages/CounterexamplesPage").then((module) => ({ default: module.CounterexamplesPage })),
);
const CounterexampleDetailPage = lazy(() =>
  import("./pages/CounterexampleDetailPage").then((module) => ({
    default: module.CounterexampleDetailPage,
  })),
);
const SearchPage = lazy(() => import("./pages/SearchPage").then((module) => ({ default: module.SearchPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const StudioPage = lazy(() => import("./pages/StudioPage").then((module) => ({ default: module.StudioPage })));
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })),
);

function PageFallback() {
  return <div className="empty-state">Loading page...</div>;
}

function preloadCommonRoutes() {
  void import("./pages/QuestionsPage");
  void import("./pages/SubjectsPage");
  void import("./pages/YearsPage");
  void import("./pages/ConceptsPage");
  void import("./pages/CounterexamplesPage");
  void import("./pages/SearchPage");
  void import("./pages/StudioPage");
}

export default function App() {
  useEffect(() => {
    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const idleHandle = idleWindow.requestIdleCallback(preloadCommonRoutes);
      return () => {
        idleWindow.cancelIdleCallback?.(idleHandle);
      };
    }

    const timeoutHandle = window.setTimeout(preloadCommonRoutes, 1200);
    return () => {
      window.clearTimeout(timeoutHandle);
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<PageFallback />}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHomePage />} />
            <Route path="content" element={<StudioPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route element={<PublicShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/questions/:slug" element={<QuestionDetailPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/years" element={<YearsPage />} />
            <Route path="/concepts" element={<ConceptsPage />} />
            <Route path="/concepts/:slug" element={<ConceptDetailPage />} />
            <Route path="/counterexamples" element={<CounterexamplesPage />} />
            <Route path="/counterexamples/:slug" element={<CounterexampleDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<Navigate to="/admin/login" replace />} />
            <Route path="/studio" element={<Navigate to="/admin/content" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
