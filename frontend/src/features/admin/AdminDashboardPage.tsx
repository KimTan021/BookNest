
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
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Snackbar from "@mui/material/Snackbar";
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
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  adminCreateAuthor,
  adminCreateBook,
  adminCreateCategory,
  adminCreateUser,
  adminDeleteAuthor,
  adminDeleteBook,
  adminDeleteCategory,
  adminGetBook,
  adminListAuthors,
  adminListCategories,
  adminListUsers,
  adminUpdateAuthor,
  adminUpdateBook,
  adminUpdateCategory,
  getAdminMetrics,
  listBooks
} from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import type {
  AdminAuthor,
  AdminAuthorRequest,
  AdminBookDetail,
  AdminBookUpdateRequest,
  AdminCategoryRequest,
  AdminCreateBookRequest,
  AdminCreateUserRequest,
  AdminMetrics,
  AdminUser,
  Book,
  Category,
  PageResponse
} from "../../types/api";

interface Notice {
  type: "success" | "error";
  message: string;
}

const DEFAULT_ROLE = "ROLE_USER";
const BOOK_PAGE_SIZE = 6;

export function AdminDashboardPage() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsStatus, setMetricsStatus] = useState("");

  const [authors, setAuthors] = useState<AdminAuthor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [userForm, setUserForm] = useState<AdminCreateUserRequest>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: DEFAULT_ROLE
  });
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userStatus, setUserStatus] = useState("");

  const [bookForm, setBookForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    authorId: "",
    categoryId: ""
  });
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [bookStatus, setBookStatus] = useState("");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [userListLoading, setUserListLoading] = useState(false);
  const [userListStatus, setUserListStatus] = useState("");

  const [bookQuery, setBookQuery] = useState("");
  const [bookPage, setBookPage] = useState(0);
  const [bookList, setBookList] = useState<PageResponse<Book> | null>(null);
  const [bookListLoading, setBookListLoading] = useState(false);
  const [bookListStatus, setBookListStatus] = useState("");

  const [editBookOpen, setEditBookOpen] = useState(false);
  const [editBook, setEditBook] = useState<AdminBookDetail | null>(null);
  const [editBookStatus, setEditBookStatus] = useState("");
  const [editBookSubmitting, setEditBookSubmitting] = useState(false);

  const [authorForm, setAuthorForm] = useState<AdminAuthorRequest>({ name: "", bio: "" });
  const [authorStatus, setAuthorStatus] = useState("");
  const [authorSubmitting, setAuthorSubmitting] = useState(false);
  const [editAuthorOpen, setEditAuthorOpen] = useState(false);
  const [editAuthor, setEditAuthor] = useState<AdminAuthor | null>(null);
  const [editAuthorStatus, setEditAuthorStatus] = useState("");

  const [categoryForm, setCategoryForm] = useState<AdminCategoryRequest>({ name: "" });
  const [categoryStatus, setCategoryStatus] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryStatus, setEditCategoryStatus] = useState("");

  const metricsItems = useMemo(() => {
    if (!metrics) {
      return [];
    }
    return [
      { label: "Users", value: metrics.users },
      { label: "Books", value: metrics.books },
      { label: "Orders", value: metrics.orders },
      { label: "Categories", value: metrics.categories },
      { label: "Authors", value: metrics.authors }
    ];
  }, [metrics]);

  async function loadMetrics() {
    if (!token) {
      return;
    }
    setMetricsLoading(true);
    setMetricsStatus("");
    try {
      const response = await getAdminMetrics(token);
      setMetrics(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load metrics";
      setMetricsStatus(message);
    } finally {
      setMetricsLoading(false);
    }
  }

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

  async function loadUsers(query?: string) {
    if (!token) {
      return;
    }
    setUserListLoading(true);
    setUserListStatus("");
    try {
      const response = await adminListUsers(token, query);
      setUsers(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load users";
      setUserListStatus(message);
    } finally {
      setUserListLoading(false);
    }
  }

  async function loadBooks(targetPage = bookPage, query = bookQuery) {
    setBookListLoading(true);
    setBookListStatus("");
    try {
      const response = await listBooks({
        page: targetPage,
        size: BOOK_PAGE_SIZE,
        title: query || undefined
      });
      setBookList(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load books";
      setBookListStatus(message);
    } finally {
      setBookListLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
  }, [token]);

  useEffect(() => {
    loadLookups();
    loadUsers();
  }, [token]);

  useEffect(() => {
    loadBooks();
  }, [bookPage, bookQuery]);

  async function submitUserForm() {
    if (!token) {
      setUserStatus("Login required.");
      return;
    }
    setUserSubmitting(true);
    setUserStatus("");
    try {
      const payload: AdminCreateUserRequest = {
        ...userForm,
        role: userForm.role?.trim() || undefined
      };
      const response: AdminUser = await adminCreateUser(token, payload);
      setNotice({
        type: "success",
        message: `User created: ${response.email} (${response.role})`
      });
      setUserForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: DEFAULT_ROLE
      });
      await Promise.all([loadMetrics(), loadUsers(userQuery)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create user";
      setUserStatus(message);
    } finally {
      setUserSubmitting(false);
    }
  }

  async function submitBookForm() {
    if (!token) {
      setBookStatus("Login required.");
      return;
    }
    setBookSubmitting(true);
    setBookStatus("");
    const priceValue = Number(bookForm.price);
    const stockValue = Number(bookForm.stock);
    const authorValue = Number(bookForm.authorId);
    const categoryValue = Number(bookForm.categoryId);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      setBookStatus("Price must be a number greater than 0.");
      setBookSubmitting(false);
      return;
    }
    if (Number.isNaN(stockValue) || stockValue < 0) {
      setBookStatus("Stock must be 0 or greater.");
      setBookSubmitting(false);
      return;
    }
    if (Number.isNaN(authorValue) || Number.isNaN(categoryValue)) {
      setBookStatus("Author and category are required.");
      setBookSubmitting(false);
      return;
    }
    try {
      const payload: AdminCreateBookRequest = {
        title: bookForm.title.trim(),
        description: bookForm.description.trim() || undefined,
        price: priceValue,
        stock: stockValue,
        imageUrl: bookForm.imageUrl.trim() || undefined,
        authorId: authorValue,
        categoryId: categoryValue
      };
      const response = await adminCreateBook(token, payload);
      setNotice({
        type: "success",
        message: `Book added: ${response.title}`
      });
      setBookForm({
        title: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        authorId: "",
        categoryId: ""
      });
      await Promise.all([loadMetrics(), loadBooks(0, bookQuery)]);
      setBookPage(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add book";
      setBookStatus(message);
    } finally {
      setBookSubmitting(false);
    }
  }

  async function openEditBook(bookId: number) {
    if (!token) {
      return;
    }
    setEditBookStatus("");
    try {
      const detail = await adminGetBook(token, bookId);
      setEditBook(detail);
      setEditBookOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load book";
      setBookListStatus(message);
    }
  }

  async function submitEditBook() {
    if (!token || !editBook) {
      return;
    }
    setEditBookSubmitting(true);
    setEditBookStatus("");
    const priceValue = Number(editBook.price);
    const stockValue = Number(editBook.stock);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      setEditBookStatus("Price must be greater than 0.");
      setEditBookSubmitting(false);
      return;
    }
    if (Number.isNaN(stockValue) || stockValue < 0) {
      setEditBookStatus("Stock must be 0 or greater.");
      setEditBookSubmitting(false);
      return;
    }
    if (!editBook.authorId || !editBook.categoryId) {
      setEditBookStatus("Author and category are required.");
      setEditBookSubmitting(false);
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
      setNotice({ type: "success", message: "Book updated." });
      setEditBookOpen(false);
      await Promise.all([loadMetrics(), loadBooks()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update book";
      setEditBookStatus(message);
    } finally {
      setEditBookSubmitting(false);
    }
  }

  async function handleDeleteBook(bookId: number) {
    if (!token) {
      return;
    }
    const confirmed = window.confirm("Delete this book? This cannot be undone.");
    if (!confirmed) {
      return;
    }
    try {
      await adminDeleteBook(token, bookId);
      setNotice({ type: "success", message: "Book deleted." });
      await Promise.all([loadMetrics(), loadBooks()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete book";
      setBookListStatus(message);
    }
  }

  async function submitAuthorForm() {
    if (!token) {
      setAuthorStatus("Login required.");
      return;
    }
    setAuthorSubmitting(true);
    setAuthorStatus("");
    try {
      const response = await adminCreateAuthor(token, {
        name: authorForm.name.trim(),
        bio: authorForm.bio?.trim() || undefined
      });
      setNotice({ type: "success", message: `Author created: ${response.name}` });
      setAuthorForm({ name: "", bio: "" });
      await Promise.all([loadMetrics(), loadLookups()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create author";
      setAuthorStatus(message);
    } finally {
      setAuthorSubmitting(false);
    }
  }

  async function submitEditAuthor() {
    if (!token || !editAuthor) {
      return;
    }
    setEditAuthorStatus("");
    try {
      const response = await adminUpdateAuthor(token, editAuthor.id, {
        name: editAuthor.name.trim(),
        bio: editAuthor.bio?.trim() || undefined
      });
      setNotice({ type: "success", message: `Author updated: ${response.name}` });
      setEditAuthorOpen(false);
      await Promise.all([loadMetrics(), loadLookups()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update author";
      setEditAuthorStatus(message);
    }
  }

  async function handleDeleteAuthor(authorId: number) {
    if (!token) {
      return;
    }
    const confirmed = window.confirm("Delete this author? This cannot be undone.");
    if (!confirmed) {
      return;
    }
    try {
      await adminDeleteAuthor(token, authorId);
      setNotice({ type: "success", message: "Author deleted." });
      await Promise.all([loadMetrics(), loadLookups()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete author";
      setAuthorStatus(message);
    }
  }

  async function submitCategoryForm() {
    if (!token) {
      setCategoryStatus("Login required.");
      return;
    }
    setCategorySubmitting(true);
    setCategoryStatus("");
    try {
      const response = await adminCreateCategory(token, { name: categoryForm.name.trim() });
      setNotice({ type: "success", message: `Category created: ${response.name}` });
      setCategoryForm({ name: "" });
      await Promise.all([loadMetrics(), loadLookups()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create category";
      setCategoryStatus(message);
    } finally {
      setCategorySubmitting(false);
    }
  }

  async function submitEditCategory() {
    if (!token || editCategoryId === null) {
      return;
    }
    setEditCategoryStatus("");
    try {
      const response = await adminUpdateCategory(token, editCategoryId, { name: editCategoryName.trim() });
      setNotice({ type: "success", message: `Category updated: ${response.name}` });
      setEditCategoryOpen(false);
      await Promise.all([loadMetrics(), loadLookups()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update category";
      setEditCategoryStatus(message);
    }
  }

  async function handleDeleteCategory(categoryId: number) {
    if (!token) {
      return;
    }
    const confirmed = window.confirm("Delete this category? This cannot be undone.");
    if (!confirmed) {
      return;
    }
    try {
      await adminDeleteCategory(token, categoryId);
      setNotice({ type: "success", message: "Category deleted." });
      await Promise.all([loadMetrics(), loadLookups()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete category";
      setCategoryStatus(message);
    }
  }
  return (
    <Box component="section">
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage users, expand the catalog, and keep the store up to date.
        </Typography>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Snapshot of catalog and customer activity.
              </Typography>
            </Box>
            <Button
              startIcon={<RefreshOutlinedIcon />}
              variant="outlined"
              onClick={loadMetrics}
              disabled={metricsLoading}
            >
              Refresh
            </Button>
          </Stack>
          <Divider sx={{ my: 2 }} />
          {metricsStatus ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {metricsStatus}
            </Alert>
          ) : null}
          {metricsLoading ? (
            <Stack alignItems="center" sx={{ py: 3 }}>
              <CircularProgress size={28} />
            </Stack>
          ) : (
            <Grid container spacing={2}>
              {metricsItems.map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="h5">{item.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Register a new user
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create customer or admin accounts directly from the dashboard.
              </Typography>
              <Stack spacing={1.5}>
                <TextField
                  label="First name"
                  value={userForm.firstName}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  required
                />
                <TextField
                  label="Last name"
                  value={userForm.lastName}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
                <TextField
                  label="Temporary password"
                  type="password"
                  value={userForm.password}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
                  required
                />
                <TextField
                  select
                  label="Role"
                  value={userForm.role ?? DEFAULT_ROLE}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value }))}
                >
                  <MenuItem value="ROLE_USER">Customer (ROLE_USER)</MenuItem>
                  <MenuItem value="ROLE_ADMIN">Admin (ROLE_ADMIN)</MenuItem>
                </TextField>
                <Button
                  variant="contained"
                  startIcon={<PersonAddAltOutlinedIcon />}
                  onClick={submitUserForm}
                  disabled={userSubmitting}
                >
                  {userSubmitting ? "Creating..." : "Create user"}
                </Button>
                {userStatus ? <Alert severity="error">{userStatus}</Alert> : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Add a new book
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Populate the catalog with new titles and inventory.
              </Typography>
              <Stack spacing={1.5}>
                <TextField
                  label="Title"
                  value={bookForm.title}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
                <TextField
                  label="Description"
                  value={bookForm.description}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, description: event.target.value }))}
                  multiline
                  minRows={3}
                />
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                  <TextField
                    label="Price"
                    type="number"
                    inputProps={{ min: 0, step: "0.01" }}
                    value={bookForm.price}
                    onChange={(event) => setBookForm((prev) => ({ ...prev, price: event.target.value }))}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Stock"
                    type="number"
                    inputProps={{ min: 0, step: "1" }}
                    value={bookForm.stock}
                    onChange={(event) => setBookForm((prev) => ({ ...prev, stock: event.target.value }))}
                    required
                    fullWidth
                  />
                </Stack>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                  <TextField
                    select
                    label="Author"
                    value={bookForm.authorId}
                    onChange={(event) => setBookForm((prev) => ({ ...prev, authorId: event.target.value }))}
                    required
                    fullWidth
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
                    value={bookForm.categoryId}
                    onChange={(event) => setBookForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                    required
                    fullWidth
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
                  value={bookForm.imageUrl}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  placeholder="https://..."
                />
                <Button
                  variant="contained"
                  startIcon={<LibraryAddOutlinedIcon />}
                  onClick={submitBookForm}
                  disabled={bookSubmitting}
                >
                  {bookSubmitting ? "Adding..." : "Add book"}
                </Button>
                {bookStatus ? <Alert severity="error">{bookStatus}</Alert> : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">Users</Typography>
              <Typography variant="body2" color="text.secondary">
                Search and review registered accounts.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField
                label="Search users"
                value={userQuery}
                onChange={(event) => setUserQuery(event.target.value)}
                size="small"
                InputProps={{ endAdornment: <SearchOutlinedIcon fontSize="small" /> }}
              />
              <Button variant="outlined" onClick={() => loadUsers(userQuery)} disabled={userListLoading}>
                Search
              </Button>
            </Stack>
          </Stack>
          <Divider sx={{ my: 2 }} />
          {userListStatus ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {userListStatus}
            </Alert>
          ) : null}
          {userListLoading ? (
            <Stack alignItems="center" sx={{ py: 3 }}>
              <CircularProgress size={26} />
            </Stack>
          ) : (
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
          )}
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">Books</Typography>
              <Typography variant="body2" color="text.secondary">
                Edit or remove catalog items.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField
                label="Search by title"
                value={bookQuery}
                onChange={(event) => {
                  setBookQuery(event.target.value);
                  setBookPage(0);
                }}
                size="small"
                InputProps={{ endAdornment: <SearchOutlinedIcon fontSize="small" /> }}
              />
            </Stack>
          </Stack>
          <Divider sx={{ my: 2 }} />
          {bookListStatus ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bookListStatus}
            </Alert>
          ) : null}
          {bookListLoading ? (
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
                  {bookList?.content.length ? (
                    bookList.content.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell>{book.title}</TableCell>
                        <TableCell>{book.authorName}</TableCell>
                        <TableCell align="right">${Number(book.price).toFixed(2)}</TableCell>
                        <TableCell align="right">{book.stock}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => openEditBook(book.id)} size="small">
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteBook(book.id)} size="small">
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
                  Page {bookList ? bookList.number + 1 : 1} of {bookList?.totalPages ?? 1}
                </Typography>
                <Pagination
                  count={bookList?.totalPages ?? 1}
                  page={(bookList?.number ?? 0) + 1}
                  onChange={(_, value) => setBookPage(value - 1)}
                />
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Authors
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage author profiles and bios.
              </Typography>
              <Stack spacing={1.5}>
                <TextField
                  label="Author name"
                  value={authorForm.name}
                  onChange={(event) => setAuthorForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
                <TextField
                  label="Bio"
                  value={authorForm.bio ?? ""}
                  onChange={(event) => setAuthorForm((prev) => ({ ...prev, bio: event.target.value }))}
                  multiline
                  minRows={2}
                />
                <Button
                  variant="contained"
                  onClick={submitAuthorForm}
                  disabled={authorSubmitting}
                >
                  {authorSubmitting ? "Creating..." : "Add author"}
                </Button>
                {authorStatus ? <Alert severity="error">{authorStatus}</Alert> : null}
              </Stack>
              <Divider sx={{ my: 2 }} />
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
                              setEditAuthorStatus("");
                              setEditAuthorOpen(true);
                            }}
                            size="small"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteAuthor(author.id)} size="small">
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Categories
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Keep the genre taxonomy clean and updated.
              </Typography>
              <Stack spacing={1.5}>
                <TextField
                  label="Category name"
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm({ name: event.target.value })}
                  required
                />
                <Button
                  variant="contained"
                  onClick={submitCategoryForm}
                  disabled={categorySubmitting}
                >
                  {categorySubmitting ? "Creating..." : "Add category"}
                </Button>
                {categoryStatus ? <Alert severity="error">{categoryStatus}</Alert> : null}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2}>No categories found.</TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={() => {
                              setEditCategoryId(category.id);
                              setEditCategoryName(category.name);
                              setEditCategoryStatus("");
                              setEditCategoryOpen(true);
                            }}
                            size="small"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteCategory(category.id)} size="small">
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={editBookOpen} onClose={() => setEditBookOpen(false)} fullWidth maxWidth="sm">
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
                onChange={(event) => setEditBook((prev) => (prev ? { ...prev, description: event.target.value } : prev))}
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
                  {authors.map((author) => (
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
                  {categories.map((category) => (
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
              {editBookStatus ? <Alert severity="error">{editBookStatus}</Alert> : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditBookOpen(false)}>Cancel</Button>
          <Button onClick={submitEditBook} variant="contained" disabled={editBookSubmitting}>
            {editBookSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editAuthorOpen} onClose={() => setEditAuthorOpen(false)} fullWidth maxWidth="sm">
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
              {editAuthorStatus ? <Alert severity="error">{editAuthorStatus}</Alert> : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditAuthorOpen(false)}>Cancel</Button>
          <Button onClick={submitEditAuthor} variant="contained">
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editCategoryOpen} onClose={() => setEditCategoryOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Edit category</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Category name"
              value={editCategoryName}
              onChange={(event) => setEditCategoryName(event.target.value)}
              required
            />
            {editCategoryStatus ? <Alert severity="error">{editCategoryStatus}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCategoryOpen(false)}>Cancel</Button>
          <Button onClick={submitEditCategory} variant="contained">
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotice(null)}
          severity={notice?.type ?? "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notice?.message ?? ""}
        </Alert>
      </Snackbar>
    </Box>
  );
}
