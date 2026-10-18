import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "@/auth/auth-context";

const TOKEN_KEY = "flowsync.token";

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(readToken);

  const setToken = useCallback((value: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, value);
    } catch {
      // Storage unavailable (e.g. private mode): keep the session in memory only.
    }
    setTokenState(value);
  }, []);

  const clearToken = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
    setTokenState(null);
  }, []);

  const value = useMemo(
    () => ({ token, setToken, clearToken }),
    [token, setToken, clearToken],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
