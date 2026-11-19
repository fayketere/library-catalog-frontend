import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchJson } from "../api";
import { coverImage } from "../utils/cover";

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setBook(null);
    Promise.all([
      fetchJson(`/books/${encodeURIComponent(id)}`, controller.signal),
      fetchJson("/genres", controller.signal),
    ])
      .then(([bookData, genres]) => {
        if (!bookData || typeof bookData.title !== "string" || !Array.isArray(genres)) {
          throw new Error("The catalog service returned an unexpected response.");
        }
        setBook(bookData);
        setGenre(genres.find(item => item.id === bookData.genre) || null);
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") setError(fetchError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  return (
    <main className="detail-page">
      <Link className="back-link" to="/">← Back to the collection</Link>
      {loading && <div className="status-panel" role="status"><span className="spinner" />Opening the book…</div>}
      {!loading && error && (
        <div className="status-panel status-panel--error detail-message" role="alert">
          <span className="status-symbol">!</span>
          <div><h1>{error.includes("404") || error.toLowerCase().includes("not found") ? "This book isn’t on our shelves." : "We couldn’t open this book."}</h1><p>{error}</p><Link className="text-button" to="/">Return to the collection</Link></div>
        </div>
      )}
      {!loading && !error && book && (
        <article className="book-detail">
          <div className="book-detail__art">
            <img src={coverImage({ ...book, genreName: genre?.name })} alt={`Cover of ${book.title}`} />
          </div>
          <div className="book-detail__copy">
            <p className="eyebrow">{genre?.name || "From the collection"}</p>
            <h1>{book.title}</h1>
            <p className="book-detail__author">by {book.author}</p>
            <div className="detail-rule" />
            <h2>About this book</h2>
            <p className="book-detail__description">
              {genre?.description || `A ${genre?.name?.toLowerCase() || "curated"} selection from our library shelves. Discover ${book.title} by ${book.author}.`}
            </p>
            <dl className="book-facts">
              <div><dt>Author</dt><dd>{book.author}</dd></div>
              <div><dt>Genre</dt><dd>{genre?.name || book.genre}</dd></div>
              <div><dt>Catalog ID</dt><dd>{book.id}</dd></div>
            </dl>
            <Link className="button button--dark" to="/">Keep exploring <span aria-hidden="true">→</span></Link>
          </div>
        </article>
      )}
    </main>
  );
}
