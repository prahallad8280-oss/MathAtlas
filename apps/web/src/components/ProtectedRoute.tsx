import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../lib/auth";
import { AuthGuardShell } from "./LoadingShell";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBooting } = useAuth();
  const location = useLocation();

  if (isBooting) {
    return <AuthGuardShell />;
  }

  if (!isAuthenticated) {
    const next = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/?auth=login&next=${encodeURIComponent(next)}`} replace />;
  }

  return <>{children}</>;
}
