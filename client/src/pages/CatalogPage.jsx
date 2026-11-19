import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

import BookCard from "../components/BookCard";
import GenreFilter from "../components/GenreFilter";
import SearchBar from "../components/SearchBar";
import { useBooks } from "../hooks/useBooks";

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [genres, setGenres] = useState([]);
  const genre = searchParams.get("genre") || "";
  const search = searchParams.get("search") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const [refreshToken, setRefreshToken] = useState(0);
  const { books, pagination, loading, error } = useBooks({ genre, search, page, refreshToken });

  const updateQuery = useCallback((updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (Object.hasOwn(updates, "genre") || Object.hasOwn(updates, "search")) next.delete("page");
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const hasFilters = Boolean(genre || search);
  const genreNames = new Map(genres.map(item => [item.id, item.name]));

  return (
    <main>
      <section className="catalog-hero">
        <div className="catalog-hero__copy">
          <p className="eyebrow">A little room for wonder</p>
          <h1>Find your next<br /><em>great read.</em></h1>
          <p className="catalog-hero__intro">A thoughtfully gathered collection, ready to be explored.</p>
        </div>
        <div className="hero-stamp" aria-hidden="true"><span>OPEN</span><strong>BOOKS</strong><span>OPEN MINDS</span><i>✳</i></div>
      </section>

      <section className="catalog-section" aria-labelledby="collection-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The shelves</p>
            <h2 id="collection-title">Explore the collection</h2>
          </div>
          {pagination && <p className="result-count">{pagination.total} {pagination.total === 1 ? "book" : "books"} to discover</p>}
        </div>

        <div className="catalog-tools">
          <SearchBar value={search} onChange={value => updateQuery({ search: value })} />
          <GenreFilter value={genre} onChange={value => updateQuery({ genre: value })} onGenresLoaded={setGenres} />
        </div>

        {loading && <div className="status-panel" role="status"><span className="spinner" />Finding books on the shelves…</div>}
        {!loading && error && (
          <div className="status-panel status-panel--error" role="alert">
            <span className="status-symbol">!</span>
            <div><h3>We couldn’t load the collection</h3><p>{error}</p><button className="text-button" onClick={() => setRefreshToken(token => token + 1)}>Try again</button></div>
          </div>
        )}
        {!loading && !error && books.length === 0 && (
          <div className="status-panel status-panel--empty">
            <span className="empty-spark" aria-hidden="true">✳</span>
            <h3>{hasFilters ? "No books match just yet." : "The shelves are waiting."}</h3>
            <p>{hasFilters ? "Try another search or clear a filter to see more books." : "There are no books in the catalog yet. Please check back soon."}</p>
            {hasFilters && <button className="text-button" onClick={() => setSearchParams({})}>Clear filters</button>}
          </div>
        )}
        {!loading && !error && books.length > 0 && (
          <>
            <div className="book-grid">
              {books.map(book => <BookCard key={book.id} book={{ ...book, genreName: genreNames.get(book.genre) }} />)}
            </div>
            {pagination?.totalPages > 1 && (
              <nav className="pagination" aria-label="Catalog pages">
                <button disabled={page <= 1} onClick={() => updateQuery({ page: String(page - 1) })}>← Previous</button>
                <span>Page {page} of {pagination.totalPages}</span>
                <button disabled={page >= pagination.totalPages} onClick={() => updateQuery({ page: String(page + 1) })}>Next →</button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
