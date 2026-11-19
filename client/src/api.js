const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/+$/, "");

export async function fetchJson(path, signal) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { signal });
  }
  catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new Error("Unable to reach the catalog service. Check that the API is running.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || `The catalog service returned an error (${response.status}).`);
  }
  return payload;
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}
