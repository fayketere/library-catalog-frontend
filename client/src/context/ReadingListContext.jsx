import { createContext, useEffect, useMemo, useState } from "react";

const ReadingListContext = createContext(null);
const storageKey = "stacks-reading-list";

function readStoredBooks() {
  try {
    const storedBooks = localStorage.getItem(storageKey);
    if (!storedBooks) return { books: [], error: "" };

    const parsedBooks = JSON.parse(storedBooks);
    if (!Array.isArray(parsedBooks)) throw new Error("Saved reading list is not a list.");

    return {
      books: parsedBooks.filter(book => book && (typeof book.id === "string" || typeof book.id === "number")),
      error: "",
    };
  }
  catch {
    return { books: [], error: "Your saved reading list could not be read from this browser." };
  }
}

export function ReadingListProvider({ children }) {
  const [initialState] = useState(readStoredBooks);
  const [readingList, setReadingList] = useState(() => initialState.books);
  const [storageError, setStorageError] = useState(() => initialState.error);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(readingList));
      setStorageError("");
    }
    catch {
      setStorageError("Your reading list could not be saved in this browser.");
    }
  }, [readingList]);

  const value = useMemo(() => ({
    readingList,
    storageError,
    addBook(book) {
      if (!book || (typeof book.id !== "string" && typeof book.id !== "number")) {
        throw new Error("A book with a valid catalog ID is required.");
      }
      setReadingList(current => current.some(item => item.id === book.id) ? current : [...current, book]);
    },
    removeBook(bookId) {
      setReadingList(current => current.filter(book => book.id !== bookId));
    },
    clearList() {
      setReadingList([]);
    },
  }), [readingList, storageError]);

  return <ReadingListContext.Provider value={value}>{children}</ReadingListContext.Provider>;
}

export default ReadingListContext;
