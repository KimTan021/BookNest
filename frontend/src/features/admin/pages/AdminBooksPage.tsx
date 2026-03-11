import { useEffect, useMemo, useState } from "react";
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
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  adminDeleteBook,
  adminGetBook,
  adminListAuthors,
  adminListCategories,
  adminUpdateBook,
  listBooks
} from "../../../lib/api";
import { useAuth } from "../../../state/AuthContext";
import type {
  AdminAuthor,
  AdminBookDetail,
  AdminBookUpdateRequest,
  Book,
  Category,
  PageResponse
} from "../../../types/api";

const BOOK_PAGE_SIZE = 8;

export function AdminBooksPage() {
  const { token } = useAuth();
  const [authors, setAuthors] = useState<AdminAuthor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [books, setBooks] = useState<PageResponse<Book> | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editBook, setEditBook] = useState<AdminBookDetail | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const totalPages = books?.totalPages ?? 1;
  const currentPage = books ? books.number + 1 : page + 1;

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

  useEffect(() => {
    loadBooks();
  }, [page, query]);

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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update book";
      setEditStatus(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(bookId: number) {
    if (!token) {
      return;
    }
    const confirmed = window.confirm("Delete this book? This cannot be undone.");
    if (!confirmed) {
      return;
    }
    try {
      await adminDeleteBook(token, bookId);
      await loadBooks();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete book";
      setStatus(message);
    }
  }

  return (
    <Box component="section">
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1">
          Books
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Edit or remove catalog items.
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">Catalog</Typography>
              <Typography variant="body2" color="text.secondary">
                Search by title and manage inventory.
              </Typography>
            </Box>
            <TextField
              label="Search by title"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
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
            <Stack alignItems="center" sx={{ py: 3 }}>
              <CircularProgress size={26} />
            </Stack>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {books?.content.length ? (
                    books.content.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell>{book.title}</TableCell>
                        <TableCell>{book.authorName}</TableCell>
                        <TableCell align="right">${Number(book.price).toFixed(2)}</TableCell>
                        <TableCell align="right">{book.stock}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => openEdit(book.id)} size="small">
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(book.id)} size="small">
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>No books found.</TableCell>
                    </TableRow>
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
    </Box>
  );
}
