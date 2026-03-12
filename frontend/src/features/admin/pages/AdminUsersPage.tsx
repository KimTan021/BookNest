import { useEffect, useMemo, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { TableSkeleton } from "../components/TableSkeleton";
import { adminCreateUser, adminListUsers, adminUpdateUserStatus } from "../../../lib/api";
import { useAuth } from "../../../state/AuthContext";
import { useToast } from "../../../state/ToastContext";
import type { AdminCreateUserRequest, AdminUser, PageResponse } from "../../../types/api";

const DEFAULT_ROLE = "ROLE_USER";
const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 250;

export function AdminUsersPage() {
  const { token, userLabel } = useAuth();
  const { showToast } = useToast();
  const [usersPage, setUsersPage] = useState<PageResponse<AdminUser> | null>(null);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [form, setForm] = useState<AdminCreateUserRequest>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: DEFAULT_ROLE
  });
  const [creating, setCreating] = useState(false);
  const [formStatus, setFormStatus] = useState("");

  const totalPages = usersPage?.totalPages ?? 1;
  const currentPage = usersPage ? usersPage.number + 1 : page + 1;
  const users = usersPage?.content ?? [];

  const searchLabel = useMemo(() => (query ? `Results for "${query}"` : "All users"), [query]);

  async function loadUsers(targetPage = page, targetQuery = query) {
    if (!token) {
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await adminListUsers({
        token,
        page: targetPage,
        size: PAGE_SIZE,
        query: targetQuery || undefined
      });
      setUsersPage(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load users";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [token, page, query]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery((currentQuery) => {
        if (currentQuery === queryInput) {
          return currentQuery;
        }
        setPage(0);
        return queryInput;
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [queryInput]);

  async function submitUser() {
    if (!token) {
      setFormStatus("Login required.");
      return;
    }
    setCreating(true);
    setFormStatus("");
    try {
      await adminCreateUser(token, {
        ...form,
        role: form.role?.trim() || undefined
      });
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: DEFAULT_ROLE
      });
      await loadUsers(0, query);
      setPage(0);
      showToast("User created successfully.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create user";
      setFormStatus(message);
      showToast(message, "error");
    } finally {
      setCreating(false);
    }
  }

  async function toggleUserStatus(user: AdminUser) {
    if (!token) {
      showToast("Login required.", "error");
      return;
    }
    try {
      const response = await adminUpdateUserStatus(token, user.id, !user.active);
      setUsersPage((current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          content: current.content.map((item) => (item.id === response.id ? response : item))
        };
      });
      showToast(
        response.active ? "User reactivated successfully." : "User deactivated successfully.",
        "success"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user status";
      showToast(message, "error");
    }
  }

  function applySearch(nextQuery?: string) {
    const value = nextQuery ?? queryInput;
    setQuery(value);
    setPage(0);
  }

  return (
    <Box component="section" className="animate-fade-in">
      <Stack spacing={0.5} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Manage Users
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor user accounts, manage permissions, and grant administrative access.
        </Typography>
      </Stack>

      <Accordion className="glass-card" sx={{ mb: 4, borderRadius: '12px !important', overflow: 'hidden', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 4, py: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', color: 'white' }}>
              <PersonAddRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Create New Account</Typography>
              <Typography variant="caption" color="text.secondary">Expand to register a new system user or admin</Typography>
            </Box>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 4, pb: 4 }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="First Name"
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Last Name"
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Stack>
            <TextField
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Temporary Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              select
              label="Account Role"
              value={form.role ?? DEFAULT_ROLE}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="ROLE_USER">Customer (ROLE_USER)</MenuItem>
              <MenuItem value="ROLE_ADMIN">Administrator (ROLE_ADMIN)</MenuItem>
            </TextField>
            <Button 
              variant="contained" 
              onClick={submitUser} 
              disabled={creating}
              size="large"
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
              startIcon={creating ? <CircularProgress size={20} color="inherit" /> : <PersonAddRoundedIcon />}
            >
              {creating ? "Creating Account..." : "Create User Account"}
            </Button>
            {formStatus ? <Alert severity="error" sx={{ borderRadius: 2 }}>{formStatus}</Alert> : null}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Card className="glass-card" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>User Directory</Typography>
              <Typography variant="body2" color="text.secondary">
                {searchLabel}
              </Typography>
            </Box>
            <TextField
              label="Filter users..."
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applySearch(queryInput);
                }
              }}
              size="small"
              sx={{ minWidth: 280 }}
              InputProps={{ 
                startAdornment: <SearchOutlinedIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />,
                sx: { borderRadius: 2 }
              }}
            />
          </Stack>
          <Divider sx={{ my: 3 }} />
          
          {loading ? (
            <Box sx={{ py: 2 }}>
              <TableSkeleton columns={5} rows={PAGE_SIZE} />
            </Box>
          ) : (
            <>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">No users found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const isSelf = Boolean(userLabel && user.email === userLabel);
                      return (
                        <TableRow key={user.id} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{`${user.firstName} ${user.lastName}`}</TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>{user.email}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "inline-flex",
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                bgcolor: user.role === 'ROLE_ADMIN' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                                color: user.role === 'ROLE_ADMIN' ? 'secondary.main' : 'primary.main'
                              }}
                            >
                              {user.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 4,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                bgcolor: user.active ? "rgba(46, 125, 50, 0.1)" : "rgba(211, 47, 47, 0.1)",
                                color: user.active ? "success.main" : "error.main"
                              }}
                            >
                              <Box 
                                sx={{ 
                                  width: 6, 
                                  height: 6, 
                                  borderRadius: '50%', 
                                  bgcolor: 'currentColor', 
                                  mr: 1 
                                }} 
                              />
                              {user.active ? "Active" : "Deactivated"}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="outlined"
                              size="small"
                              color={user.active ? "error" : "success"}
                              disabled={isSelf}
                              onClick={() => toggleUserStatus(user)}
                              sx={{ borderRadius: 2, minWidth: 100 }}
                            >
                              {user.active ? "Deactivate" : "Restore"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {users.length} of {usersPage?.totalElements ?? 0} users
                </Typography>
                <Pagination
                  count={Math.max(1, totalPages)}
                  page={currentPage}
                  onChange={(_event, value) => setPage(value - 1)}
                  color="primary"
                  shape="rounded"
                />
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

    </Box>
  );
}
