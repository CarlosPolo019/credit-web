import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as loginRequest, setTokenProvider } from "../api/client.js";
import { clearSession, readSession, writeSession } from "./auth.storage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession());

  useEffect(() => {
    setTokenProvider(() => readSession()?.token ?? null);
    const onExpired = () => {
      clearSession();
      setSession(null);
    };
    window.addEventListener("credit-auth-expired", onExpired);
    return () => window.removeEventListener("credit-auth-expired", onExpired);
  }, []);

  const login = useCallback(async (username, password) => {
    const response = await loginRequest(username, password);
    const nextSession = {
      token: response.token,
      tokenType: response.tokenType,
      expiresAt: response.expiresAt,
      user: response.user,
    };
    writeSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      state: {
        isAuthenticated: Boolean(session?.token),
        token: session?.token ?? null,
        user: session?.user ?? null,
      },
      login,
      logout,
    }),
    [login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }
  return context;
}
