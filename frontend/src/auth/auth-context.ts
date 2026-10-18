import { createContext, use } from "react";

export type AuthContextValue = {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
