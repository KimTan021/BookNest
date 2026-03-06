import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

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
        sx={{
          textTransform: "none",
          ...(isActive(path)
            ? { bgcolor: "rgba(255,255,255,0.2)", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" } }
            : {})
        }}
      >
        {label}
      </Button>
    );
  }

  return (
    <Box>
      <AppBar position="static" color="primary">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, minHeight: 64 }}>
            <Typography
              component={RouterLink}
              to="/"
              variant="h6"
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 700,
                whiteSpace: "nowrap"
              }}
            >
              Online Bookstore
            </Typography>

            <Stack direction="row" spacing={0.5} sx={{ ml: "auto", flexWrap: "wrap" }}>
              {navButton("/", "Books")}
              {navButton("/cart", "Cart")}
              {navButton("/orders", "Orders")}
              {isAuthenticated ? (
                <Button
                  onClick={logout}
                  color="inherit"
                  variant="outlined"
                  sx={{ textTransform: "none", borderColor: "rgba(255,255,255,0.5)" }}
                >
                  Logout
                </Button>
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

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}
