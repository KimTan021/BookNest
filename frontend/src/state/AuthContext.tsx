import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { clearToken, getToken, saveToken } from "../lib/storage";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userLabel: string | null;
  role: string | null;
  isAdmin: boolean;
  setAuthToken: (token: string, expiresInSeconds: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function parsePayload(token: string | null): { email?: string; sub?: string; role?: string } | null {
  if (!token) {
    return null;
  }

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) {
      return null;
    }

    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const payloadJson = atob(padded);
    return JSON.parse(payloadJson) as { email?: string; sub?: string; role?: string };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getToken());

  const value = useMemo<AuthState>(
    () => {
      const payload = parsePayload(token);
      const role = payload?.role ?? null;
      return {
        token,
        isAuthenticated: Boolean(token),
        userLabel: payload?.email ?? payload?.sub ?? null,
        role,
        isAdmin: role === "ROLE_ADMIN",
        setAuthToken: (nextToken, expiresInSeconds) => {
          saveToken(nextToken, expiresInSeconds);
          setToken(nextToken);
        },
        logout: () => {
          clearToken();
          setToken(null);
        }
      };
    },
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
