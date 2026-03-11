import { useEffect, useMemo, useState } from "react";
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
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { TableSkeleton } from "../components/TableSkeleton";
import { adminCreateUser, adminListUsers } from "../../../lib/api";
import { useAuth } from "../../../state/AuthContext";
import type { AdminCreateUserRequest, AdminUser, PageResponse } from "../../../types/api";

const DEFAULT_ROLE = "ROLE_USER";
const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 250;

export function AdminUsersPage() {
  const { token } = useAuth();
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create user";
      setFormStatus(message);
    } finally {
      setCreating(false);
    }
  }

  function applySearch(nextQuery?: string) {
    const value = nextQuery ?? queryInput;
    setQuery(value);
    setPage(0);
  }

  return (
    <Box component="section">
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1">
          Users
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review registered accounts and create new users.
        </Typography>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Register a new user
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              label="First name"
              value={form.firstName}
              onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
              required
            />
            <TextField
              label="Last name"
              value={form.lastName}
              onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
            <TextField
              label="Temporary password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
            <TextField
              select
              label="Role"
              value={form.role ?? DEFAULT_ROLE}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            >
              <MenuItem value="ROLE_USER">Customer (ROLE_USER)</MenuItem>
              <MenuItem value="ROLE_ADMIN">Admin (ROLE_ADMIN)</MenuItem>
            </TextField>
            <Button variant="contained" onClick={submitUser} disabled={creating}>
              {creating ? "Creating..." : "Create user"}
            </Button>
            {formStatus ? <Alert severity="error">{formStatus}</Alert> : null}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">User directory</Typography>
              <Typography variant="body2" color="text.secondary">
                {searchLabel}
              </Typography>
            </Box>
            <TextField
              label="Search users"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applySearch(queryInput);
                }
              }}
              size="small"
              InputProps={{ endAdornment: <SearchOutlinedIcon fontSize="small" /> }}
            />
          </Stack>
          <Divider sx={{ my: 2 }} />
          {status ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {status}
            </Alert>
          ) : null}
          {loading ? (
            <Box sx={{ py: 2 }}>
              <TableSkeleton columns={3} rows={PAGE_SIZE} />
            </Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>No users found.</TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Page {currentPage} of {Math.max(1, totalPages)}
                </Typography>
                <Pagination
                  count={Math.max(1, totalPages)}
                  page={currentPage}
                  onChange={(_event, value) => setPage(value - 1)}
                />
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
