import { Link, Route, Routes } from "react-router-dom";

import BookDetailPage from "./pages/BookDetailPage";
import CatalogPage from "./pages/CatalogPage";

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
  return (
    <>
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="Stacks home"><span className="wordmark__icon">S</span>stacks<span className="wordmark__period">.</span></Link>
        <span className="header-note">Your neighborhood library</span>
        <a className="header-link" href="#collection-title">Browse books <span aria-hidden="true">↓</span></a>
      </header>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <footer className="site-footer"><span>Stacks <span className="wordmark__period">.</span></span><span>Good books make good company.</span></footer>
    </>
  );
}
