import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { TableSkeleton } from "../components/TableSkeleton";
import {
  adminCreateAuthor,
  adminDeleteAuthor,
  adminSearchAuthors,
  adminUpdateAuthor
} from "../../../lib/api";
import { useAuth } from "../../../state/AuthContext";
import type { AdminAuthor, AdminAuthorRequest, PageResponse } from "../../../types/api";

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 250;

export function AdminAuthorsPage() {
  const { token } = useAuth();
  const [authorsPage, setAuthorsPage] = useState<PageResponse<AdminAuthor> | null>(null);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [form, setForm] = useState<AdminAuthorRequest>({ name: "", bio: "" });
  const [submitting, setSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editAuthor, setEditAuthor] = useState<AdminAuthor | null>(null);
  const [editStatus, setEditStatus] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const totalPages = authorsPage?.totalPages ?? 1;
  const currentPage = authorsPage ? authorsPage.number + 1 : page + 1;
  const authors = authorsPage?.content ?? [];

  const searchLabel = useMemo(() => (query ? `Results for "${query}"` : "All authors"), [query]);

  async function loadAuthors(targetPage = page, targetQuery = query) {
    if (!token) {
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await adminSearchAuthors({
        token,
        page: targetPage,
        size: PAGE_SIZE,
        query: targetQuery || undefined
      });
      setAuthorsPage(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load authors";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAuthors();
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

  async function submitAuthor() {
    if (!token) {
      setStatus("Login required.");
      return;
    }
    setSubmitting(true);
    setStatus("");
    try {
      await adminCreateAuthor(token, {
        name: form.name.trim(),
        bio: form.bio?.trim() || undefined
      });
      setForm({ name: "", bio: "" });
      await loadAuthors(0, query);
      setPage(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create author";
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function saveEdit() {
    if (!token || !editAuthor) {
      return;
    }
    setEditStatus("");
    try {
      await adminUpdateAuthor(token, editAuthor.id, {
        name: editAuthor.name.trim(),
        bio: editAuthor.bio?.trim() || undefined
      });
      setEditOpen(false);
      await loadAuthors(page, query);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update author";
      setEditStatus(message);
    }
  }

  async function performDelete() {
    if (!token || deleteId === null) {
      return;
    }
    try {
      await adminDeleteAuthor(token, deleteId);
      setDeleteId(null);
      await loadAuthors(page, query);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete author";
      setStatus(message);
      setDeleteId(null);
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
          Authors
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage author profiles and bios.
        </Typography>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Add author
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              label="Author name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <TextField
              label="Bio"
              value={form.bio ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
              multiline
              minRows={2}
            />
            <Button variant="contained" onClick={submitAuthor} disabled={submitting}>
              {submitting ? "Creating..." : "Add author"}
            </Button>
            {status ? <Alert severity="error">{status}</Alert> : null}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">Author list</Typography>
              <Typography variant="body2" color="text.secondary">
                {searchLabel}
              </Typography>
            </Box>
            <TextField
              label="Search authors"
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
                    <TableCell>Bio</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {authors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>No authors found.</TableCell>
                    </TableRow>
                  ) : (
                    authors.map((author) => (
                      <TableRow key={author.id}>
                        <TableCell>{author.name}</TableCell>
                        <TableCell>{author.bio ?? "-"}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={() => {
                              setEditAuthor(author);
                              setEditStatus("");
                              setEditOpen(true);
                            }}
                            size="small"
                            color="primary"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => setDeleteId(author.id)} size="small" color="error">
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
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
                  onChange={(_, value) => setPage(value - 1)}
                />
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit author</DialogTitle>
        <DialogContent>
          {editAuthor ? (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <TextField
                label="Author name"
                value={editAuthor.name}
                onChange={(event) => setEditAuthor((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                required
              />
              <TextField
                label="Bio"
                value={editAuthor.bio ?? ""}
                onChange={(event) => setEditAuthor((prev) => (prev ? { ...prev, bio: event.target.value } : prev))}
                multiline
                minRows={3}
              />
              {editStatus ? <Alert severity="error">{editStatus}</Alert> : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={saveEdit} variant="contained">
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Author"
        description="Are you sure you want to permanently delete this author? This may break relationships with existing books."
        confirmLabel="Delete Author"
        confirmIcon={<DeleteOutlineOutlinedIcon />}
        onConfirm={performDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
