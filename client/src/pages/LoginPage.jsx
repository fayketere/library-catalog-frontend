import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const registrationMessage = location.state?.registrationComplete
    ? "Your account is ready. Sign in to continue."
    : "";

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login({ identifier, password });
      navigate(location.state?.from?.pathname || "/", { replace: true });
    }
    catch (loginError) {
      setError(loginError.message);
    }
    finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="eyebrow">Welcome back</p>
        <h1 id="login-title">Sign in to your library</h1>
        <p className="auth-panel__intro">Use your email address or username to continue.</p>
        {registrationMessage && <p className="form-message" role="status">{registrationMessage}</p>}
        {error && <p className="form-message form-message--error" role="alert">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-identifier">Email or username</label>
          <input id="login-identifier" name="identifier" autoComplete="username" value={identifier} onChange={event => setIdentifier(event.target.value)} required />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
          <button className="button button--dark" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"} <span aria-hidden="true">→</span></button>
        </form>
        <p className="auth-panel__switch">New to Stacks? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  );
}
