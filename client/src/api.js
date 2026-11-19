const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/+$/, "");
const authApiBaseUrl = apiBaseUrl.replace(/\/v1$/, "");

async function requestJson(url, options = {}) {
  let response;
  try {
    response = await fetch(url, options);
  }
  catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new Error("Unable to reach the library service. Check that the API is running.");
  }

  let payload = null;
  if (response.status !== 204) {
    try {
      payload = await response.json();
    }
    catch {
      payload = null;
    }
  }
  if (!response.ok) {
    const error = new Error(payload?.message || `The library service returned an error (${response.status}).`);
    error.status = response.status;
    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      error.message += `: ${payload.errors.map(item => `${item.field}: ${item.message}`).join(", ")}`;
    }
    throw error;
  }
  return payload;
}

export function fetchJson(path, signal) {
  return requestJson(`${apiBaseUrl}${path}`, { signal });
}

export function fetchAuthJson(path, options = {}) {
  return requestJson(`${authApiBaseUrl}${path}`, { credentials: "include", ...options });
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}
