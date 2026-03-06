import AppBar from "@mui/material/AppBar";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useThemeMode } from "../state/ThemeModeContext";

export function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();

  function isActive(path: string): boolean {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  function navButton(path: string, label: string) {
    return (
      <Button
        key={path}
        component={RouterLink}
        to={path}
        variant={isActive(path) ? "contained" : "text"}
        color="inherit"
        sx={(theme) => ({
          textTransform: "none",
          ...(isActive(path)
            ? {
                bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.28 : 0.12),
                "&:hover": {
                  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.34 : 0.18)
                }
              }
            : {})
        })}
      >
        {label}
      </Button>
    );
  }

  return (
    <Box>
      <AppBar position="sticky" color="primary">
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              gap: 2,
              minHeight: 72,
              py: 1
            }}
          >
            <Typography
              component={RouterLink}
              to="/"
              variant="h6"
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 700,
                whiteSpace: "nowrap",
                letterSpacing: "-0.012em"
              }}
            >
              Kim's Online Bookstore
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              sx={(theme) => ({
                ml: "auto",
                flexWrap: "wrap",
                p: 0.5,
                borderRadius: 999,
                backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.78 : 0.52),
                border: `1px solid ${theme.palette.divider}`
              })}
            >
              {navButton("/", "Books")}
              <Button onClick={toggleMode} color="inherit" variant="text">
                {mode === "light" ? "Dark" : "Light"}
              </Button>
              {isAuthenticated ? (
                <>
                  {navButton("/cart", "Cart")}
                  {navButton("/orders", "Orders")}
                  <Button
                    onClick={() => {
                      logout();
                      navigate("/", { replace: true });
                    }}
                    color="inherit"
                    variant="outlined"
                    sx={(theme) => ({ textTransform: "none", borderColor: theme.palette.divider })}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  {navButton("/login", "Login")}
                  {navButton("/register", "Register")}
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3.5 }}>
        {children}
      </Container>
    </Box>
  );
}
