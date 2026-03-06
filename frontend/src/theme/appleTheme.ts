import { alpha, createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

const appleFontStack = [
  "SF Pro Text",
  "SF Pro Display",
  "-apple-system",
  "BlinkMacSystemFont",
  "'Helvetica Neue'",
  "Segoe UI",
  "Arial",
  "sans-serif"
].join(",");

export function createAppleTheme(mode: PaletteMode) {
  const isDark = mode === "dark";
  const baseText = isDark ? "#f5f5f7" : "#1d1d1f";
  const baseSecondaryText = isDark ? "#a1a1a6" : "#6e6e73";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#0a84ff" : "#0071e3"
      },
      secondary: {
        main: "#34c759"
      },
      background: {
        default: isDark ? "#0f1012" : "#f5f5f7",
        paper: isDark ? alpha("#1c1c1e", 0.72) : alpha("#ffffff", 0.78)
      },
      text: {
        primary: baseText,
        secondary: baseSecondaryText
      },
      divider: isDark ? alpha("#ffffff", 0.12) : alpha("#1d1d1f", 0.08)
    },
    shape: {
      borderRadius: 18
    },
    typography: {
      fontFamily: appleFontStack,
      h5: {
        fontWeight: 600,
        letterSpacing: "-0.01em"
      },
      h6: {
        fontWeight: 600,
        letterSpacing: "-0.01em"
      },
      button: {
        textTransform: "none",
        fontWeight: 600
      }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: isDark
              ? "radial-gradient(140% 120% at 10% -10%, #303239 0%, #111217 45%, #0b0c10 100%)"
              : "radial-gradient(140% 120% at 10% -10%, #ffffff 0%, #f5f5f7 46%, #ececf1 100%)",
            minHeight: "100vh"
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? alpha("#16161a", 0.7) : alpha("#ffffff", 0.7),
            color: baseText,
            backdropFilter: "saturate(180%) blur(18px)",
            borderBottom: `1px solid ${isDark ? alpha("#ffffff", 0.1) : alpha("#1d1d1f", 0.08)}`,
            boxShadow: "none"
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: "saturate(160%) blur(8px)",
            border: `1px solid ${isDark ? alpha("#ffffff", 0.1) : alpha("#1d1d1f", 0.08)}`,
            boxShadow: isDark
              ? "0 14px 30px rgba(0, 0, 0, 0.35)"
              : "0 12px 30px rgba(15, 15, 20, 0.08)",
            transition: "transform 220ms ease, box-shadow 220ms ease"
          }
        }
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true
        },
        styleOverrides: {
          root: {
            borderRadius: 999,
            minHeight: 40,
            paddingInline: 18,
            transition: "transform 180ms ease, filter 180ms ease"
          },
          containedPrimary: {
            background: isDark
              ? "linear-gradient(180deg, #42a1ff 0%, #0a84ff 100%)"
              : "linear-gradient(180deg, #2997ff 0%, #0071e3 100%)"
          }
        }
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined"
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? alpha("#2b2b30", 0.88) : alpha("#ffffff", 0.88),
            borderRadius: 14
          }
        }
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 14
          }
        }
      }
    }
  });
}
