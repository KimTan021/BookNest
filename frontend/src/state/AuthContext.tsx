import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { clearToken, getToken, saveToken } from "../lib/storage";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setAuthToken: (token: string, expiresInSeconds: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getToken());

  const value = useMemo<AuthState>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      setAuthToken: (nextToken, expiresInSeconds) => {
        saveToken(nextToken, expiresInSeconds);
        setToken(nextToken);
      },
      logout: () => {
        clearToken();
        setToken(null);
      }
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
