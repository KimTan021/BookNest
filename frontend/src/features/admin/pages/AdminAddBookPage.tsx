import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import { adminCreateBook, adminListAuthors, adminListCategories } from "../../../lib/api";
import { useAuth } from "../../../state/AuthContext";
import { useToast } from "../../../state/ToastContext";
import type { AdminAuthor, AdminCreateBookRequest, Category } from "../../../types/api";

export function AdminAddBookPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [authors, setAuthors] = useState<AdminAuthor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    authorId: "",
    categoryId: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
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
    loadLookups();
  }, [token]);

  async function submitBook() {
    if (!token) {
      setStatus("Login required.");
      return;
    }
    setSubmitting(true);
    setStatus("");
    const priceValue = Number(form.price);
    const stockValue = Number(form.stock);
    const authorValue = Number(form.authorId);
    const categoryValue = Number(form.categoryId);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      setStatus("Price must be a number greater than 0.");
      setSubmitting(false);
      return;
    }
    if (Number.isNaN(stockValue) || stockValue < 0) {
      setStatus("Stock must be 0 or greater.");
      setSubmitting(false);
      return;
    }
    if (Number.isNaN(authorValue) || Number.isNaN(categoryValue)) {
      setStatus("Author and category are required.");
      setSubmitting(false);
      return;
    }
    try {
      const payload: AdminCreateBookRequest = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        price: priceValue,
        stock: stockValue,
        imageUrl: form.imageUrl.trim() || undefined,
        authorId: authorValue,
        categoryId: categoryValue
      };
      await adminCreateBook(token, payload);
      setForm({
        title: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        authorId: "",
        categoryId: ""
      });
      showToast("Book added to catalog.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add book";
      setStatus(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box component="section">
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1">
          Add Book
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a new catalog entry.
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              multiline
              minRows={3}
            />
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                label="Price"
                type="number"
                inputProps={{ min: 0, step: "0.01" }}
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Stock"
                type="number"
                inputProps={{ min: 0, step: "1" }}
                value={form.stock}
                onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                required
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                select
                label="Author"
                value={form.authorId}
                onChange={(event) => setForm((prev) => ({ ...prev, authorId: event.target.value }))}
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
                value={form.categoryId}
                onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
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
              value={form.imageUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              placeholder="https://..."
            />
            <Button
              variant="contained"
              startIcon={<LibraryAddOutlinedIcon />}
              onClick={submitBook}
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add book"}
            </Button>
            {status ? <Alert severity="error">{status}</Alert> : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
