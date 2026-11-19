import { Link } from "react-router-dom";

import { coverImage } from "../utils/cover";

export default function BookCard({ book }) {
  const image = coverImage(book);
  return (
    <article className="book-card">
      <Link className="book-card__link" to={`/books/${encodeURIComponent(book.id)}`}>
        <div className="book-card__cover">
          <img src={image} alt={`Cover of ${book.title}`} loading="lazy" />
          <span className="book-card__open">View book <span aria-hidden="true">↗</span></span>
        </div>
        <div className="book-card__info">
          <span className="book-card__genre">{book.genreName || "Genre unavailable"}</span>
          <h2>{book.title}</h2>
          <p>{book.author}</p>
        </div>
      </Link>
    </article>
  );
}
