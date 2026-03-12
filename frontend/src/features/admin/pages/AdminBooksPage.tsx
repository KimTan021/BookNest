import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
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
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { TableSkeleton } from "../components/TableSkeleton";
import {
  adminCreateBook,
  adminDeleteBook,
  adminGetBook,
  adminListAuthors,
  adminListCategories,
  adminUpdateBook,
  listBooks
} from "../../../lib/api";
import { useAuth } from "../../../state/AuthContext";
import { useToast } from "../../../state/ToastContext";
import type {
  AdminAuthor,
  AdminBookDetail,
  AdminBookUpdateRequest,
  AdminCreateBookRequest,
  Book,
  Category,
  PageResponse
} from "../../../types/api";

const BOOK_PAGE_SIZE = 8;

export function AdminBooksPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get("edit");
    if (editId && token) {
      openEdit(Number(editId));
    }
  }, [location.search, token]);
  const [authors, setAuthors] = useState<AdminAuthor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [books, setBooks] = useState<PageResponse<Book> | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [addForm, setAddForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    authorId: "",
    categoryId: ""
  });
  const [adding, setAdding] = useState(false);
  const [addStatus, setAddStatus] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editBook, setEditBook] = useState<AdminBookDetail | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const totalPages = books?.totalPages ?? 1;
  const currentPage = books ? books.number + 1 : page + 1;

  const searchLabel = useMemo(() => (query ? `Results for "${query}"` : "All books"), [query]);

  const authorOptions = useMemo(() => authors, [authors]);
  const categoryOptions = useMemo(() => categories, [categories]);

  async function loadLookups() {
    if (!token) {
      return;
    }
    try {
      const [authorsResponse, categoriesResponse] = await Promise.all([
        adminListAuthors(token),
        adminListCategories(token)
      ]);
      setAuthors(authorsResponse);
      setCategories(categoriesResponse);
    } catch {
      setAuthors([]);
      setCategories([]);
    }
  }

  async function loadBooks(targetPage = page, targetQuery = query) {
    setLoading(true);
    setStatus("");
    try {
      const response = await listBooks({
        page: targetPage,
        size: BOOK_PAGE_SIZE,
        title: targetQuery || undefined
      });
      setBooks(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load books";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLookups();
  }, [token]);

  async function submitNewBook() {
    if (!token) {
      setAddStatus("Login required.");
      return;
    }
    setAdding(true);
    setAddStatus("");
    const priceValue = Number(addForm.price);
    const stockValue = Number(addForm.stock);
    const authorValue = Number(addForm.authorId);
    const categoryValue = Number(addForm.categoryId);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      setAddStatus("Price must be a number greater than 0.");
      setAdding(false);
      return;
    }
    if (Number.isNaN(stockValue) || stockValue < 0) {
      setAddStatus("Stock must be 0 or greater.");
      setAdding(false);
      return;
    }
    if (Number.isNaN(authorValue) || Number.isNaN(categoryValue)) {
      setAddStatus("Author and category are required.");
      setAdding(false);
      return;
    }
    try {
      const payload: AdminCreateBookRequest = {
        title: addForm.title.trim(),
        description: addForm.description.trim() || undefined,
        price: priceValue,
        stock: stockValue,
        imageUrl: addForm.imageUrl.trim() || undefined,
        authorId: authorValue,
        categoryId: categoryValue
      };
      await adminCreateBook(token, payload);
      setAddForm({
        title: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        authorId: "",
        categoryId: ""
      });
      showToast("Book added to catalog.", "success");
      await loadBooks(0, query);
      setPage(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add book";
      setAddStatus(message);
      showToast(message, "error");
    } finally {
      setAdding(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, [page, query]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery((currentQuery) => {
        if (currentQuery === queryInput) {
          return currentQuery;
        }
        setPage(0);
        return queryInput;
      });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [queryInput]);

  function applySearch(nextQuery?: string) {
    const value = nextQuery ?? queryInput;
    setQuery(value);
    setPage(0);
  }

  async function openEdit(bookId: number) {
    if (!token) {
      return;
    }
    setEditStatus("");
    try {
      const detail = await adminGetBook(token, bookId);
      setEditBook(detail);
      setEditOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load book";
      setStatus(message);
    }
  }

  async function saveEdit() {
    if (!token || !editBook) {
      return;
    }
    setSaving(true);
    setEditStatus("");
    const priceValue = Number(editBook.price);
    const stockValue = Number(editBook.stock);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      setEditStatus("Price must be greater than 0.");
      setSaving(false);
      return;
    }
    if (Number.isNaN(stockValue) || stockValue < 0) {
      setEditStatus("Stock must be 0 or greater.");
      setSaving(false);
      return;
    }
    if (!editBook.authorId || !editBook.categoryId) {
      setEditStatus("Author and category are required.");
      setSaving(false);
      return;
    }
    try {
      const payload: AdminBookUpdateRequest = {
        title: editBook.title.trim(),
        description: editBook.description?.trim() || undefined,
        price: priceValue,
        stock: stockValue,
        imageUrl: editBook.imageUrl?.trim() || undefined,
        authorId: editBook.authorId,
        categoryId: editBook.categoryId
      };
      await adminUpdateBook(token, editBook.id, payload);
      setEditOpen(false);
      await loadBooks();
      showToast("Book updated successfully.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update book";
      setEditStatus(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function performDelete() {
    if (!token || deleteId === null) {
      return;
    }
    try {
      await adminDeleteBook(token, deleteId);
      setDeleteId(null);
      await loadBooks();
      showToast("Book deleted.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete book";
      setStatus(message);
      showToast(message, "error");
      setDeleteId(null);
    }
  }

  return (
    <Box component="section" className="animate-fade-in">
      <Stack spacing={0.5} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Manage Books
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Maintain your catalog, update prices, and track inventory levels.
        </Typography>
      </Stack>

      <Accordion className="glass-card" sx={{ mb: 4, borderRadius: '12px !important', overflow: 'hidden', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 4, py: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', color: 'white' }}>
              <LibraryAddOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Add New Book</Typography>
              <Typography variant="caption" color="text.secondary">Expand to add a new book to the catalog</Typography>
            </Box>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 4, pb: 4 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Title"
              value={addForm.title}
              onChange={(event) => setAddForm((prev) => ({ ...prev, title: event.target.value }))}
              required
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Description"
              value={addForm.description}
              onChange={(event) => setAddForm((prev) => ({ ...prev, description: event.target.value }))}
              multiline
              minRows={3}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Price"
                type="number"
                inputProps={{ min: 0, step: "0.01" }}
                value={addForm.price}
                onChange={(event) => setAddForm((prev) => ({ ...prev, price: event.target.value }))}
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Stock"
                type="number"
                inputProps={{ min: 0, step: "1" }}
                value={addForm.stock}
                onChange={(event) => setAddForm((prev) => ({ ...prev, stock: event.target.value }))}
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                label="Author"
                value={addForm.authorId}
                onChange={(event) => setAddForm((prev) => ({ ...prev, authorId: event.target.value }))}
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="">Select author</MenuItem>
                {authors.map((author) => (
                  <MenuItem key={author.id} value={String(author.id)}>
                    {author.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Category"
                value={addForm.categoryId}
                onChange={(event) => setAddForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="">Select category</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              label="Image URL"
              value={addForm.imageUrl}
              onChange={(event) => setAddForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              placeholder="https://..."
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button
              variant="contained"
              startIcon={<LibraryAddOutlinedIcon />}
              onClick={submitNewBook}
              disabled={adding}
              size="large"
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
            >
              {adding ? "Adding to Catalog..." : "Add Book to Catalog"}
            </Button>
            {addStatus ? <Alert severity="error" sx={{ borderRadius: 2 }}>{addStatus}</Alert> : null}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Card className="glass-card" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} sx={{ mb: 3 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Catalog Inventory</Typography>
              <Typography variant="body2" color="text.secondary">
                {searchLabel}
              </Typography>
            </Box>
            <TextField
              label="Search books..."
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
          <Divider sx={{ mb: 3 }} />
          {status ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {status}
            </Alert>
          ) : null}
          {loading ? (
            <Box sx={{ py: 2 }}>
              <TableSkeleton columns={6} rows={BOOK_PAGE_SIZE} />
            </Box>
          ) : (
            <>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Cover</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Stock</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {books?.content.length ? (
                    books.content.map((book) => {
                      const isLowStock = book.stock < 5;
                      return (
                        <TableRow key={book.id} hover sx={{ transition: "background-color 0.2s" }}>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box
                              component="img"
                              src={book.imageUrl || "https://placehold.co/40x60?text=Book"}
                              alt={book.title}
                              sx={{ 
                                width: 40, 
                                height: 56, 
                                objectFit: "cover", 
                                borderRadius: 1,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{book.title}</TableCell>
                          <TableCell color="text.secondary">{book.authorName}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            ${Number(book.price).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.875rem",
                                fontWeight: 700,
                                bgcolor: isLowStock ? "rgba(211, 47, 47, 0.1)" : "rgba(46, 125, 50, 0.1)",
                                color: isLowStock ? "error.main" : "success.main"
                              }}
                            >
                              {book.stock}
                              {isLowStock && <ErrorOutlineOutlinedIcon sx={{ ml: 0.5, fontSize: 16 }} />}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <IconButton onClick={() => openEdit(book.id)} size="small" color="primary" title="Edit Book">
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton onClick={() => setDeleteId(book.id)} size="small" color="error" title="Delete Book">
                                <DeleteOutlineOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body2" color="text.secondary">No books found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {books?.content.length ?? 0} of {books?.totalElements ?? 0} books
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
        <DialogTitle>Edit book</DialogTitle>
        <DialogContent>
          {editBook ? (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <TextField
                label="Title"
                value={editBook.title}
                onChange={(event) => setEditBook((prev) => (prev ? { ...prev, title: event.target.value } : prev))}
                required
              />
              <TextField
                label="Description"
                value={editBook.description ?? ""}
                onChange={(event) =>
                  setEditBook((prev) => (prev ? { ...prev, description: event.target.value } : prev))
                }
                multiline
                minRows={3}
              />
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                <TextField
                  label="Price"
                  type="number"
                  inputProps={{ min: 0, step: "0.01" }}
                  value={editBook.price}
                  onChange={(event) =>
                    setEditBook((prev) => (prev ? { ...prev, price: Number(event.target.value) } : prev))
                  }
                  required
                  fullWidth
                />
                <TextField
                  label="Stock"
                  type="number"
                  inputProps={{ min: 0, step: "1" }}
                  value={editBook.stock}
                  onChange={(event) =>
                    setEditBook((prev) => (prev ? { ...prev, stock: Number(event.target.value) } : prev))
                  }
                  required
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                <TextField
                  select
                  label="Author"
                  value={editBook.authorId ?? ""}
                  onChange={(event) =>
                    setEditBook((prev) => (prev ? { ...prev, authorId: Number(event.target.value) } : prev))
                  }
                  required
                  fullWidth
                >
                  {authorOptions.map((author) => (
                    <MenuItem key={author.id} value={author.id}>
                      {author.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Category"
                  value={editBook.categoryId ?? ""}
                  onChange={(event) =>
                    setEditBook((prev) => (prev ? { ...prev, categoryId: Number(event.target.value) } : prev))
                  }
                  required
                  fullWidth
                >
                  {categoryOptions.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <TextField
                label="Image URL"
                value={editBook.imageUrl ?? ""}
                onChange={(event) => setEditBook((prev) => (prev ? { ...prev, imageUrl: event.target.value } : prev))}
              />
              {editStatus ? <Alert severity="error">{editStatus}</Alert> : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={saveEdit} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Book"
        description="Are you sure you want to permanently delete this book from the catalog? This action cannot be undone."
        confirmLabel="Delete Book"
        confirmIcon={<DeleteOutlineOutlinedIcon />}
        onConfirm={performDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
