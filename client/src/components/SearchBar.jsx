import { useEffect, useState } from "react";

export default function SearchBar({ value, onChange }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (draft !== value) onChange(draft);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [draft, value, onChange]);

  return (
    <div className="search-field">
      <label htmlFor="catalog-search">Search the collection</label>
      <div className="search-field__input">
        <span aria-hidden="true">⌕</span>
        <input
          id="catalog-search"
          type="search"
          value={draft}
          onChange={event => setDraft(event.target.value)}
          placeholder="Try a title or author"
          autoComplete="off"
        />
        {draft && <button type="button" className="search-field__clear" onClick={() => setDraft("")} aria-label="Clear search">×</button>}
      </div>
    </div>
  );
}
