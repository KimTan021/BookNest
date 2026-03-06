import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { PaletteMode } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { createAppleTheme } from "../theme/appleTheme";

const STORAGE_KEY = "bookstore_theme_mode";

interface ThemeModeContextValue {
  mode: PaletteMode;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

function resolveInitialMode(): PaletteMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(resolveInitialMode);

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      toggleMode: () => {
        setMode((previous) => {
          const next = previous === "light" ? "dark" : "light";
          localStorage.setItem(STORAGE_KEY, next);
          return next;
        });
      }
    }),
    [mode]
  );

  const theme = useMemo(() => createAppleTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return context;
}
