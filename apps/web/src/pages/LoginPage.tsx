import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("admin@mathatlas.dev");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const next = searchParams.get("next") ?? "/studio";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(next);
    }
  }, [isAuthenticated, navigate, next]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      navigate(next);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="centered-page">
      <article className="detail-card auth-card">
        <div className="eyebrow">Author & Admin Access</div>
        <h2>Login to open the content studio.</h2>
        <p>
          Public browsing stays open for everyone. Only content creation and editing require a signed-in
          author or admin account.
        </p>

        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="demo-credentials">
          <strong>Demo credentials</strong>
          <span>Admin: admin@mathatlas.dev / Admin@123</span>
          <span>Author: author@mathatlas.dev / Author@123</span>
        </div>
      </article>
    </div>
  );
}
