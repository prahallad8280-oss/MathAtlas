import { Navigate, useSearchParams } from "react-router-dom";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  return <Navigate to={`/?auth=login&next=${encodeURIComponent(next)}`} replace />;
}
