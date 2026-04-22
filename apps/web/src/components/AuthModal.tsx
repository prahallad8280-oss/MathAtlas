import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

type AuthMode = "login" | "create";

type AuthModalProps = {
  mode: AuthMode;
  next: string | null;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthModal({ mode, next, onClose, onModeChange }: AuthModalProps) {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(next ?? "/admin", { replace: true });
    }
  }, [isAuthenticated, navigate, next]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login(loginEmail, loginPassword);
      navigate(next ?? "/admin", { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await register(name, registerEmail, registerPassword, confirmPassword);
      navigate(next ?? "/admin", { replace: true });
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Unable to create your ID.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div aria-modal="true" className="auth-modal-backdrop" onClick={onClose} role="dialog">
      <div className="auth-modal-card" onClick={(event) => event.stopPropagation()}>
        <button aria-label="Close login popup" className="auth-modal-close" onClick={onClose} type="button">
          x
        </button>

        <div className="auth-modal-header">
          <div className="eyebrow">Private Access</div>
          <h2>{mode === "login" ? "Login to MathAtlas" : "Create your MathAtlas ID"}</h2>
          <p>
            Public reading stays open to everyone. Admins and authors use this private popup to enter the
            dashboard or create a new author ID.
          </p>
        </div>

        <div className="auth-switch-row">
          <button
            className={mode === "login" ? "tab-button active" : "tab-button"}
            onClick={() => onModeChange("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === "create" ? "tab-button active" : "tab-button"}
            onClick={() => onModeChange("create")}
            type="button"
          >
            Create ID
          </button>
        </div>

        {mode === "login" ? (
          <form className="stack-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                autoComplete="email"
                placeholder="admin@mathatlas.dev"
                required
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                type="email"
              />
            </label>
            <label>
              Password
              <input
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                type="password"
              />
            </label>
            <div className="button-row">
              <button className="primary-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
              <button className="ghost-button" onClick={() => onModeChange("create")} type="button">
                Create ID
              </button>
            </div>
          </form>
        ) : (
          <form className="stack-form" onSubmit={handleRegister}>
            <label>
              Full Name
              <input
                autoComplete="name"
                placeholder="Your full name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                type="text"
              />
            </label>
            <label>
              Email
              <input
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
                type="email"
              />
            </label>
            <label>
              Password
              <input
                autoComplete="new-password"
                placeholder="At least 6 characters"
                required
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                type="password"
              />
            </label>
            <label>
              Confirm Password
              <input
                autoComplete="new-password"
                placeholder="Repeat password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
              />
            </label>
            <div className="button-row">
              <button className="primary-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating..." : "Create ID"}
              </button>
              <button className="ghost-button" onClick={() => onModeChange("login")} type="button">
                Back to Login
              </button>
            </div>
          </form>
        )}

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="demo-credentials">
          <strong>Access note</strong>
          <span>If the database is empty, the first created ID becomes ADMIN.</span>
          <span>After that, new signups become AUTHOR accounts.</span>
          <span>Seeded demo IDs still work after running the Prisma seed command.</span>
        </div>
      </div>
    </div>
  );
}
