import { useEffect, useState } from "react";

import { fetchJson } from "../api";

export function useBooks({ genre, search, page, limit = 12, refreshToken = 0 }) {
  const [result, setResult] = useState({ books: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (genre) query.set("genre", genre);
    if (search.trim()) query.set("search", search.trim());

    setLoading(true);
    setError("");
    fetchJson(`/books?${query}`, controller.signal)
      .then((payload) => {
        if (!Array.isArray(payload?.data) || !payload?.pagination) {
          throw new Error("The catalog service returned an unexpected response.");
        }
        setResult({ books: payload.data, pagination: payload.pagination });
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message);
          setResult({ books: [], pagination: null });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [genre, search, page, limit, refreshToken]);

  return { ...result, loading, error };
}
