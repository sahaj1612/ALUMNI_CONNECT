import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "alumni-connect-session";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { token: "", user: null };
  });
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(session.token));

  useEffect(() => {
    if (!session.token) {
      setIsBootstrapping(false);
      return;
    }

    // This keeps refreshes honest and avoids showing a stale role in the UI.
    apiRequest("/auth/me", { token: session.token })
      .then((response) => {
        setSession((current) => ({
          ...current,
          user: response.user,
        }));
      })
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setSession({ token: "", user: null });
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, [session.token]);

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isBootstrapping,
      setSession(nextSession) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
      },
      logout() {
        window.localStorage.removeItem(STORAGE_KEY);
        setSession({ token: "", user: null });
      },
    }),
    [isBootstrapping, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
