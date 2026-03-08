import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "@mui/material/Alert";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { addToCart, listBooks, listCategories } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import type { Book, Category, PageResponse } from "../../types/api";

const DEFAULT_PAGE_SIZE = 8;

export function BooksPage() {
  const [titleInput, setTitleInput] = useState("");
  const [categoryIdInput, setCategoryIdInput] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(0);
  const [booksPage, setBooksPage] = useState<PageResponse<Book> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const { isAuthenticated, token } = useAuth();

  const totalPages = booksPage?.totalPages ?? 1;
  const currentPage = booksPage ? booksPage.number + 1 : page + 1;
  const bookItems = booksPage?.content ?? [];
  const showInitialSkeleton = loading && bookItems.length === 0;

  const categoryParam = useMemo(() => {
    if (!categoryId) {
      return undefined;
    }
    const parsed = Number(categoryId);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [categoryId]);

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        const response = await listCategories();
        if (!cancelled) {
          setCategories(response);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadBooks() {
      setLoading(true);
      setStatus("");
      try {
        const response = await listBooks({
          page,
          size: DEFAULT_PAGE_SIZE,
          title: title || undefined,
          categoryId: categoryParam
        });
        if (!cancelled) {
          setBooksPage(response);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load books";
          setStatus(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadBooks();
    return () => {
      cancelled = true;
    };
  }, [page, title, categoryParam]);

  async function onQuickAdd(bookId: number) {
    if (!token) {
      setActionNotice({ type: "error", message: "Login is required to add items to cart." });
      return;
    }
    try {
      await addToCart(token, bookId, 1);
      const message = "Item added to cart.";
      setActionNotice({ type: "success", message });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Add to cart failed";
      setActionNotice({ type: "error", message });
    }
  }

  function applyFilters(nextCategoryIdInput?: string) {
    const categoryValue = nextCategoryIdInput ?? categoryIdInput;
    setTitle(titleInput);
    setCategoryId(categoryValue);
    setPage(0);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  return (
    <Box component="section">
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            Browse books
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Discover your next read with lightweight filtering and fast add-to-cart.
          </Typography>
          <Stack
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters();
            }}
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ md: "flex-end" }}
          >
            <TextField
              label="Title search"
              value={titleInput}
              onChange={(event) => setTitleInput(event.target.value)}
              placeholder="clean code"
              size="small"
              fullWidth
            />
            <TextField
              label="Category"
              select
              value={categoryIdInput}
              onChange={(event) => {
                const value = event.target.value;
                setCategoryIdInput(value);
                applyFilters(value);
              }}
              size="small"
              sx={{ minWidth: { md: 160 } }}
            >
              <MenuItem value="">All categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={String(category.id)}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              type="submit"
              variant="contained"
              size="small"
              startIcon={<SearchOutlinedIcon />}
              sx={{ minWidth: 88, height: 40 }}
            >
              Apply
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<RefreshOutlinedIcon />}
              sx={{ minWidth: 88, height: 40 }}
              onClick={() => {
                setTitleInput("");
                setCategoryIdInput("");
                setTitle("");
                setCategoryId("");
                setPage(0);
              }}
            >
              Reset
            </Button>
          </Stack>
          {status ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {status}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Box sx={{ position: "relative", minHeight: 320 }}>
        <Grid container spacing={2}>
          {showInitialSkeleton
            ? Array.from({ length: 8 }).map((_, index) => (
              <Grid key={`skeleton-${index}`} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card>
                  <Skeleton variant="rectangular" height={250} />
                  <CardContent>
                    <Skeleton width="75%" />
                    <Skeleton width="50%" />
                    <Skeleton width="30%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
            : bookItems.map((book) => (
              <Grid key={book.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 20px 36px rgba(15, 15, 20, 0.12)"
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={book.imageUrl || "https://placehold.co/300x420?text=Book"}
                    alt={book.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: "1rem", mb: 0.5 }}>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {book.authorName || "Unknown author"}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${Number(book.price).toFixed(2)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={Link}
                      to={`/books/${book.id}`}
                      variant="outlined"
                      size="small"
                    >
                      View details
                    </Button>
                    <Button
                      type="button"
                      variant="contained"
                      size="small"
                      startIcon={<AddShoppingCartOutlinedIcon />}
                      onClick={() => onQuickAdd(book.id)}
                      disabled={!isAuthenticated}
                    >
                      Add to cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>

        {loading && !showInitialSkeleton ? (
          <Box
            sx={(theme) => ({
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              backdropFilter: "blur(1px)",
              backgroundColor:
                theme.palette.mode === "dark" ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.35)"
            })}
          >
            <CircularProgress size={26} />
          </Box>
        ) : null}
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Page {currentPage} of {Math.max(1, totalPages)}
        </Typography>
        <Pagination
          count={Math.max(1, totalPages)}
          page={currentPage}
          color="primary"
          onChange={(_, value) => {
            setPage(value - 1);
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          }}
        />
      </Stack>

      <Snackbar
        open={Boolean(actionNotice)}
        autoHideDuration={2600}
        onClose={() => setActionNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setActionNotice(null)}
          severity={actionNotice?.type ?? "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {actionNotice?.message ?? ""}
        </Alert>
      </Snackbar>
    </Box>
  );
}
