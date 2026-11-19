import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { fetchAuthJson } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [authError, setAuthError] = useState("");

  const refreshProfile = useCallback(async (signal) => {
    setStatus("loading");
    setAuthError("");
    try {
      const profile = await fetchAuthJson("/users/profile", { signal });
      setUser(profile);
      setStatus("authenticated");
    }
    catch (error) {
      if (error.name === "AbortError") return;
      if (error.status === 401) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }
      setUser(null);
      setAuthError(error.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    refreshProfile(controller.signal);
    return () => controller.abort();
  }, [refreshProfile]);

  const login = useCallback(async ({ identifier, password }) => {
    const response = await fetchAuthJson("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    if (!response?.user) throw new Error("The authentication service returned an unexpected response.");
    setUser(response.user);
    setAuthError("");
    setStatus("authenticated");
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    const response = await fetchAuthJson("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response?.user) throw new Error("The authentication service returned an unexpected response.");
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    await fetchAuthJson("/auth/logout", { method: "POST" });
    setUser(null);
    setAuthError("");
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(() => ({
    user,
    status,
    authError,
    login,
    register,
    logout,
    refreshProfile,
  }), [user, status, authError, login, register, logout, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider.");
  return context;
}
