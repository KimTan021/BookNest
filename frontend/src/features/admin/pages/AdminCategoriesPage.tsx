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
  adminCreateCategory,
  adminDeleteCategory,
  adminSearchCategories,
  adminUpdateCategory
} from "../../../lib/api";
import { useAuth } from "../../../state/AuthContext";
import { useToast } from "../../../state/ToastContext";
import type { Category, PageResponse } from "../../../types/api";

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 250;

export function AdminCategoriesPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [categoriesPage, setCategoriesPage] = useState<PageResponse<Category> | null>(null);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const totalPages = categoriesPage?.totalPages ?? 1;
  const currentPage = categoriesPage ? categoriesPage.number + 1 : page + 1;
  const categories = categoriesPage?.content ?? [];

  const searchLabel = useMemo(() => (query ? `Results for "${query}"` : "All categories"), [query]);

  async function loadCategories(targetPage = page, targetQuery = query) {
    if (!token) {
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await adminSearchCategories({
        token,
        page: targetPage,
        size: PAGE_SIZE,
        query: targetQuery || undefined
      });
      setCategoriesPage(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load categories";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
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

  async function submitCategory() {
    if (!token) {
      setStatus("Login required.");
      return;
    }
    setSubmitting(true);
    setStatus("");
    try {
      await adminCreateCategory(token, { name: name.trim() });
      setName("");
      await loadCategories(0, query);
      setPage(0);
      showToast("Category created successfully.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create category";
      setStatus(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function saveEdit() {
    if (!token || editId === null) {
      return;
    }
    setEditStatus("");
    try {
      await adminUpdateCategory(token, editId, { name: editName.trim() });
      setEditOpen(false);
      await loadCategories(page, query);
      showToast("Category updated successfully.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update category";
      setEditStatus(message);
      showToast(message, "error");
    }
  }

  async function performDelete() {
    if (!token || deleteId === null) {
      return;
    }
    try {
      await adminDeleteCategory(token, deleteId);
      setDeleteId(null);
      await loadCategories(page, query);
      showToast("Category deleted.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete category";
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
          Manage Categories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Organize your catalog by maintaining a clear and consistent genre taxonomy.
        </Typography>
      </Stack>

      <Accordion className="glass-card" sx={{ mb: 4, borderRadius: '12px !important', overflow: 'hidden', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 4, py: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', color: 'white' }}>
              <AddRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Add New Category</Typography>
              <Typography variant="caption" color="text.secondary">Define a new genre or topic for your books</Typography>
            </Box>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 4, pb: 4 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Category Name"
              placeholder="e.g. Science Fiction, Biography, etc."
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button 
              variant="contained" 
              onClick={submitCategory} 
              disabled={submitting}
              size="large"
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <AddRoundedIcon />}
            >
              {submitting ? "Creating..." : "Create Category"}
            </Button>
            {status ? <Alert severity="error" sx={{ borderRadius: 2 }}>{status}</Alert> : null}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Card className="glass-card" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Category Inventory</Typography>
              <Typography variant="body2" color="text.secondary">
                {searchLabel}
              </Typography>
            </Box>
            <TextField
              label="Filter categories..."
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
              <TableSkeleton columns={2} rows={PAGE_SIZE} />
            </Box>
          ) : (
            <>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">No categories found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{category.name}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton
                              onClick={() => {
                                setEditId(category.id);
                                setEditName(category.name);
                                setEditStatus("");
                                setEditOpen(true);
                              }}
                              size="small"
                              color="primary"
                              title="Edit Category"
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => setDeleteId(category.id)} size="small" color="error" title="Delete Category">
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
                  Showing {categories.length} of {categoriesPage?.totalElements ?? 0} categories
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

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Edit category</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Category name"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              required
            />
            {editStatus ? <Alert severity="error">{editStatus}</Alert> : null}
          </Stack>
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
        title="Delete Category"
        description="Are you sure you want to permanently delete this category? This action cannot be undone."
        confirmLabel="Delete Category"
        confirmIcon={<DeleteOutlineOutlinedIcon />}
        onConfirm={performDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
