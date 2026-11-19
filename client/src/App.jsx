import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import BookingPage from "./pages/BookingPage";
import BookDetailPage from "./pages/BookDetailPage";
import CatalogPage from "./pages/CatalogPage";
import LoginPage from "./pages/LoginPage";
import ReadingListPage from "./pages/ReadingListPage";
import RegisterPage from "./pages/RegisterPage";

function NotFoundPage() {
  return (
    <main className="detail-page">
      <div className="status-panel status-panel--empty detail-message">
        <span className="empty-spark" aria-hidden="true">✳</span>
        <h1>We can’t find that page.</h1>
        <Link className="text-button" to="/">Return to the collection</Link>
      </div>
    </main>
  );
}

export default function App() {
  const { user, status, logout } = useAuth();
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setLogoutError("");
    try {
      await logout();
    }
    catch (error) {
      setLogoutError(error.message);
    }
  }

  return (
    <>
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="Stacks home"><span className="wordmark__icon">S</span>stacks<span className="wordmark__period">.</span></Link>
        <span className="header-note">Your neighborhood library</span>
        <nav className="header-nav" aria-label="Main navigation">
          <Link className="header-link" to="/#collection-title">Browse books</Link>
          <Link className="header-link" to="/reading-list">Reading list</Link>
          <Link className="header-link" to="/booking">Book a space</Link>
          {status === "authenticated"
            ? <><span className="header-user">{user?.username}</span><button className="header-button" type="button" onClick={handleLogout}>Sign out</button></>
            : <><Link className="header-link" to="/login">Sign in</Link><Link className="header-link" to="/register">Register</Link></>}
        </nav>
      </header>
      {logoutError && <p className="global-error" role="alert">{logoutError}</p>}
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/reading-list" element={<ReadingListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <footer className="site-footer"><span>Stacks <span className="wordmark__period">.</span></span><span>Good books make good company.</span></footer>
    </>
  );
}
