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
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import { useToast } from "../../../state/ToastContext";
import type { AdminAuthor, AdminAuthorRequest, PageResponse } from "../../../types/api";

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 250;

export function AdminAuthorsPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
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
      showToast("Author added successfully.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create author";
      setStatus(message);
      showToast(message, "error");
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
      showToast("Author updated successfully.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update author";
      setEditStatus(message);
      showToast(message, "error");
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
      showToast("Author deleted.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete author";
      setStatus(message);
      showToast(message, "error");
      setDeleteId(null);
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
          Manage Authors
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Control author profiles, bios, and their association with your books.
        </Typography>
      </Stack>

      <Accordion className="glass-card" sx={{ mb: 4, borderRadius: '12px !important', overflow: 'hidden', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 4, py: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', color: 'white' }}>
              <AddRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Add New Author</Typography>
              <Typography variant="caption" color="text.secondary">Expand to fill in author details</Typography>
            </Box>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 4, pb: 4 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Author Full Name"
              placeholder="e.g. George Orwell"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Biography"
              placeholder="Brief professional history of the author..."
              value={form.bio ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
              multiline
              minRows={3}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button 
              variant="contained" 
              onClick={submitAuthor} 
              disabled={submitting}
              size="large"
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <AddRoundedIcon />}
            >
              {submitting ? "Creating Author..." : "Create Author Profile"}
            </Button>
            {status ? <Alert severity="error" sx={{ borderRadius: 2 }}>{status}</Alert> : null}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Card className="glass-card" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Author Directory</Typography>
              <Typography variant="body2" color="text.secondary">
                {searchLabel}
              </Typography>
            </Box>
            <TextField
              label="Filter authors..."
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
              <TableSkeleton columns={3} rows={PAGE_SIZE} />
            </Box>
          ) : (
            <>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Biography</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {authors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">No authors found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    authors.map((author) => (
                      <TableRow key={author.id} hover>
                        <TableCell sx={{ fontWeight: 500, width: '25%' }}>{author.name}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', width: '60%' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.6
                            }}
                          >
                            {author.bio || "No biography provided."}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton
                              onClick={() => {
                                setEditAuthor(author);
                                setEditStatus("");
                                setEditOpen(true);
                              }}
                              size="small"
                              color="primary"
                              title="Edit Author"
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => setDeleteId(author.id)} size="small" color="error" title="Delete Author">
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {authors.length} of {authorsPage?.totalElements ?? 0} authors
                </Typography>
                <Pagination
                  count={Math.max(1, totalPages)}
                  page={currentPage}
                  onChange={(_, value) => setPage(value - 1)}
                  color="primary"
                  shape="rounded"
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
