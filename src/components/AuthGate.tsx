import { useState, type FormEvent } from "react";
import {
  clearAuthSession,
  isAppPasswordEnabled,
  isAuthenticated,
  setAuthSession,
  verifyPassword,
} from "../lib/auth";

type Props = {
  children: React.ReactNode;
};

export function AuthGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(() => {
    if (!isAppPasswordEnabled()) return true;
    return isAuthenticated();
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isAppPasswordEnabled() || unlocked) {
    return <>{children}</>;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (verifyPassword(password)) {
      setAuthSession();
      setError("");
      setUnlocked(true);
      return;
    }
    setError("Incorrect password.");
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-brand">
          <div className="brand-kicker">Young · BidSheet</div>
          <h1 className="brand-title">BidSheet</h1>
          <p className="brand-sub">
            Enter the site password to open estimates and administration.
          </p>
        </div>
        <div className="field">
          <label htmlFor="site-password">Password</label>
          <input
            id="site-password"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Site password"
          />
        </div>
        {error ? <div className="auth-error">{error}</div> : null}
        <button type="submit" className="btn btn-accent auth-submit">
          Unlock
        </button>
      </form>
    </div>
  );
}

export function LockButton() {
  if (!isAppPasswordEnabled()) return null;
  return (
    <button
      type="button"
      className="btn"
      onClick={() => {
        clearAuthSession();
        window.location.reload();
      }}
    >
      Lock
    </button>
  );
}
