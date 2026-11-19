import { Link } from "react-router-dom";

import { useReadingList } from "../hooks/useReadingList";
import { coverImage } from "../utils/cover";

export default function BookCard({ book }) {
  const { readingList, addBook, removeBook } = useReadingList();
  const isSaved = readingList.some(item => item.id === book.id);
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
      <button
        className="book-card__save"
        type="button"
        onClick={() => isSaved ? removeBook(book.id) : addBook(book)}
        aria-label={`${isSaved ? "Remove" : "Add"} ${book.title} ${isSaved ? "from" : "to"} your reading list`}
      >
        {isSaved ? "Remove from list" : "Add to reading list"}
      </button>
    </article>
  );
}
