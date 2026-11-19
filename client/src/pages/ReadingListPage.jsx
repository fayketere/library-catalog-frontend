import { Link } from "react-router-dom";

import BookCard from "../components/BookCard";
import { useReadingList } from "../hooks/useReadingList";

export default function ReadingListPage() {
  const { readingList, clearList, storageError } = useReadingList();

  return (
    <main className="reading-list-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">For another day</p>
          <h1>Your reading list</h1>
        </div>
        {readingList.length > 0 && <button className="text-button reading-list-clear" onClick={clearList}>Clear list</button>}
      </div>
      {storageError && <p className="form-message form-message--error" role="alert">{storageError}</p>}
      {readingList.length === 0 ? (
        <div className="status-panel status-panel--empty">
          <span className="empty-spark" aria-hidden="true">✳</span>
          <h2>Your list is ready for a good book.</h2>
          <p>Save something from the collection and it will be waiting here next time.</p>
          <Link className="text-button" to="/">Explore the collection</Link>
        </div>
      ) : (
        <div className="book-grid">
          {readingList.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      )}
    </main>
  );
}
