import { useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BookOutlinedIcon from "@mui/icons-material/BookOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { NavLink, Outlet } from "react-router-dom";

const drawerWidth = 240;
const collapsedWidth = 72;

const navItems = [
  { label: "Overview", to: "/admin", icon: <AdminPanelSettingsOutlinedIcon /> },
  { label: "Users", to: "/admin/users", icon: <GroupOutlinedIcon /> },
  { label: "Books", to: "/admin/books", icon: <BookOutlinedIcon /> },
  { label: "Add Book", to: "/admin/books/new", icon: <LibraryAddOutlinedIcon /> },
  { label: "Authors", to: "/admin/authors", icon: <PersonOutlineOutlinedIcon /> },
  { label: "Categories", to: "/admin/categories", icon: <CategoryOutlinedIcon /> }
];

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const desktopWidth = collapsed ? collapsedWidth : drawerWidth;

  const drawerContent = (
    <>
      <Stack
        sx={{
          px: collapsed ? 1.5 : 2.5,
          py: 2.5,
          alignItems: collapsed ? "center" : "flex-start"
        }}
        spacing={0.5}
      >
        <Typography variant="overline" color="text.secondary" sx={{ display: collapsed ? "none" : "block" }}>
          Admin Console
        </Typography>
        <Typography variant="h6" sx={{ display: collapsed ? "none" : "block" }}>BookNest</Typography>
        <IconButton
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((value) => !value)}
          sx={{ display: { xs: "none", md: "inline-flex" } }}
        >
          {collapsed ? <ChevronRightOutlinedIcon /> : <ChevronLeftOutlinedIcon />}
        </IconButton>
      </Stack>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === "/admin"}
            onClick={() => setMobileOpen(false)}
            sx={(theme) => ({
              borderRadius: 1,
              mb: 0.5,
              justifyContent: collapsed ? "center" : "flex-start",
              "&.active": {
                bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
                "&:hover": { 
                  bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"
                }
              },
              "&:hover": { bgcolor: "action.hover" }
            })}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, justifyContent: "center" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} sx={{ display: collapsed ? "none" : "block" }} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "70vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: desktopWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: desktopWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0,0,0,0.08)"
          },
          display: { xs: "none", md: "block" }
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box"
          }
        }}
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, pl: { md: 3 }, width: "100%" }}>
        <Stack direction="row" alignItems="center" sx={{ mb: 2, display: { xs: "flex", md: "none" } }}>
          <IconButton aria-label="Open admin navigation" onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ ml: 1 }}>
            Admin
          </Typography>
        </Stack>
        <Outlet />
      </Box>
    </Box>
  );
}
