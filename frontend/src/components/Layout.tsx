import AppBar from "@mui/material/AppBar";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import BookOutlinedIcon from "@mui/icons-material/BookOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useThemeMode } from "../state/ThemeModeContext";

export function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout, userLabel } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const mobileMenuOpen = Boolean(mobileMenuAnchor);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const accountMenuOpen = Boolean(accountMenuAnchor);

  function isActive(path: string): boolean {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  function navButton(path: string, label: string, icon?: ReactNode) {
    return (
      <Button
        key={path}
        component={RouterLink}
        to={path}
        startIcon={icon}
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

  function openMobileMenu(event: MouseEvent<HTMLElement>) {
    setMobileMenuAnchor(event.currentTarget);
  }

  function closeMobileMenu() {
    setMobileMenuAnchor(null);
  }

  function closeAccountMenu() {
    setAccountMenuAnchor(null);
  }

  function mobileNavAction(path: string) {
    navigate(path);
    closeMobileMenu();
  }

  return (
    <Box>
      <AppBar position="sticky" color="primary">
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              gap: 2,
              minHeight: { xs: 64, md: 72 },
              py: { xs: 0.75, md: 1 },
              flexWrap: { xs: "wrap", md: "nowrap" },
              alignItems: { xs: "center", md: "center" },
              rowGap: { xs: 0.5, md: 0 }
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
                letterSpacing: "-0.012em",
                fontSize: { xs: "1rem", md: "1.25rem" },
                lineHeight: 1.15,
                whiteSpace: { xs: "normal", md: "nowrap" },
                overflowWrap: "anywhere",
                maxWidth: { xs: "100%", md: "none" },
                flexGrow: { xs: 1, md: 0 },
                pr: { xs: 1, md: 0 }
              }}
            >
              Kim's Online Bookstore
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{
                ml: { xs: "auto", md: 0.75 },
                order: { xs: 2, md: 0 },
                flexShrink: 0
              }}
            >
              <LightModeOutlinedIcon fontSize="small" />
              <Switch
                size="small"
                checked={mode === "dark"}
                onChange={toggleMode}
                inputProps={{ "aria-label": "Toggle light and dark theme" }}
              />
              <DarkModeOutlinedIcon fontSize="small" />
            </Stack>

            <Stack
              direction="row"
              spacing={0.75}
              sx={(theme) => ({
                ml: "auto",
                flexWrap: "wrap",
                p: 0.5,
                borderRadius: 999,
                backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.78 : 0.52),
                border: `1px solid ${theme.palette.divider}`,
                display: { xs: "none", md: "flex" }
              })}
            >
              {navButton("/", "Books", <BookOutlinedIcon />)}
              {isAuthenticated ? (
                <>
                  {navButton("/cart", "Cart", <ShoppingCartOutlinedIcon />)}
                  {navButton("/orders", "Orders", <ReceiptLongOutlinedIcon />)}
                  <Button
                    onClick={(event) => setAccountMenuAnchor(event.currentTarget)}
                    startIcon={<AccountCircleOutlinedIcon />}
                    color="inherit"
                    variant="outlined"
                    sx={(theme) => ({ textTransform: "none", borderColor: theme.palette.divider })}
                  >
                    {userLabel ?? "Account"}
                  </Button>
                </>
              ) : (
                <>
                  {navButton("/login", "Login", <LoginOutlinedIcon />)}
                  {navButton("/register", "Register", <PersonAddAltOutlinedIcon />)}
                </>
              )}
            </Stack>

            <IconButton
              color="inherit"
              aria-label="Open navigation menu"
              sx={{ ml: 0.25, display: { xs: "inline-flex", md: "none" }, order: { xs: 3, md: 0 } }}
              onClick={openMobileMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={mobileMenuAnchor} open={mobileMenuOpen} onClose={closeMobileMenu}>
              <MenuItem selected={isActive("/")} onClick={() => mobileNavAction("/")}>
                <ListItemIcon>
                  <BookOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Books</ListItemText>
              </MenuItem>
              {isAuthenticated ? (
                [
                  <MenuItem key="cart" selected={isActive("/cart")} onClick={() => mobileNavAction("/cart")}>
                    <ListItemIcon>
                      <ShoppingCartOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Cart</ListItemText>
                  </MenuItem>,
                  <MenuItem key="orders" selected={isActive("/orders")} onClick={() => mobileNavAction("/orders")}>
                    <ListItemIcon>
                      <ReceiptLongOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Orders</ListItemText>
                  </MenuItem>,
                  <MenuItem
                    key="logout"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                      navigate("/", { replace: true });
                    }}
                  >
                    <ListItemIcon>
                      <LogoutOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                ]
              ) : (
                [
                  <MenuItem key="login" selected={isActive("/login")} onClick={() => mobileNavAction("/login")}>
                    <ListItemIcon>
                      <LoginOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Login</ListItemText>
                  </MenuItem>,
                  <MenuItem
                    key="register"
                    selected={isActive("/register")}
                    onClick={() => mobileNavAction("/register")}
                  >
                    <ListItemIcon>
                      <PersonAddAltOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Register</ListItemText>
                  </MenuItem>
                ]
              )}
            </Menu>
            <Menu anchorEl={accountMenuAnchor} open={accountMenuOpen} onClose={closeAccountMenu}>
              <MenuItem
                onClick={() => {
                  logout();
                  closeAccountMenu();
                  navigate("/", { replace: true });
                }}
              >
                <ListItemIcon>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3.5 }}>
        {children}
      </Container>
    </Box>
  );
}
