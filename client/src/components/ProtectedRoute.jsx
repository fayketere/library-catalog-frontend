import { Link, Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { status, authError, refreshProfile } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <main className="detail-page"><div className="status-panel" role="status"><span className="spinner" />Checking your library account…</div></main>;
  }

  if (status === "error") {
    return (
      <main className="detail-page">
        <div className="status-panel status-panel--error" role="alert">
          <span className="status-symbol">!</span>
          <div>
            <h3>We couldn’t verify your account</h3>
            <p>{authError}</p>
            <button className="text-button" onClick={() => refreshProfile()}>Try again</button>
          </div>
        </div>
      </main>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || <Link to="/login">Sign in</Link>;
}
