import { useEffect, useState } from "react";

import { fetchJson } from "../api";

export default function GenreFilter({ value, onChange, onGenresLoaded }) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchJson("/genres", controller.signal)
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("The genre service returned an unexpected response.");
        setGenres(data);
        onGenresLoaded(data);
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") setError(fetchError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="filter-field">
      <label htmlFor="genre-filter">Browse by genre</label>
      <select
        id="genre-filter"
        value={value}
        onChange={event => onChange(event.target.value)}
        disabled={loading || Boolean(error) || genres.length === 0}
        aria-describedby={error ? "genre-filter-status" : undefined}
      >
        <option value="">{loading ? "Loading genres…" : "All genres"}</option>
        {genres.map(genre => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
      </select>
      {error && <span className="field-note field-note--error" id="genre-filter-status">Genres unavailable: {error}</span>}
      {!loading && !error && genres.length === 0 && <span className="field-note" id="genre-filter-status">No genres have been added yet.</span>}
    </div>
  );
}
