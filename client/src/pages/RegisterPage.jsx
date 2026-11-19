import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register, status } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register({ username, email, password });
      navigate("/login", { replace: true, state: { registrationComplete: true } });
    }
    catch (registrationError) {
      setError(registrationError.message);
    }
    finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="register-title">
        <p className="eyebrow">Make yourself at home</p>
        <h1 id="register-title">Join your library</h1>
        <p className="auth-panel__intro">Create an account to save books and request a space.</p>
        {error && <p className="form-message form-message--error" role="alert">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-username">Username</label>
          <input id="register-username" name="username" autoComplete="username" minLength={3} maxLength={50} value={username} onChange={event => setUsername(event.target.value)} required />
          <label htmlFor="register-email">Email</label>
          <input id="register-email" name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} required />
          <label htmlFor="register-password">Password</label>
          <input id="register-password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} required />
          <p className="field-note">Use between 8 and 128 characters.</p>
          <button className="button button--dark" type="submit" disabled={submitting}>{submitting ? "Creating account…" : "Create account"} <span aria-hidden="true">→</span></button>
        </form>
        <p className="auth-panel__switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
