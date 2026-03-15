import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    // Call backend to clear server-side cookie, then clear client state
    apiClient
      .post("/auth/logout")
      .finally(() => {
        setUser(null);
        setIsLoading(false);
        const path = window.location.pathname;
        if (path !== "/login" && path !== "/auth/callback") {
          window.location.href = "/login";
        }
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    apiClient
      .get("/auth/me")
      .then((res) => {
        if (cancelled) return;
        setUser(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setUser(null);
        if (err.response && err.response.status === 401) {
          const path = window.location.pathname;
          if (path !== "/login" && path !== "/auth/callback") {
            window.location.href = "/login";
          }
        }
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      logout,
      isLoading,
    }),
    [user, logout, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
