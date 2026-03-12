import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { BookCard } from "../../components/BookCard";
import { EmptyState } from "../../components/EmptyState";
import { addToCart, addToFavorites, addToWishlist, getFavorites, getWishlist, listAuthors, listBooks, listCategories, removeFromFavorites, removeFromWishlist } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import { useCart } from "../../state/CartContext";
import { useToast } from "../../state/ToastContext";
import type { AuthorSummary, Book, Category, PageResponse } from "../../types/api";

const DEFAULT_PAGE_SIZE = 8;
const TITLE_SEARCH_DEBOUNCE_MS = 250;

export function BooksPage() {
  const [titleInput, setTitleInput] = useState("");
  const [categoryIdInput, setCategoryIdInput] = useState("");
  const [authorIdInput, setAuthorIdInput] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [page, setPage] = useState(0);
  const [booksPage, setBooksPage] = useState<PageResponse<Book> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<AuthorSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const { isAuthenticated, token, isAdmin } = useAuth();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

  const authorParam = useMemo(() => {
    if (!authorId) {
      return undefined;
    }
    const parsed = Number(authorId);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [authorId]);

  useEffect(() => {
    let cancelled = false;
    async function loadFilters() {
      try {
        const [categoryResponse, authorResponse] = await Promise.all([
          listCategories(),
          listAuthors()
        ]);
        if (!cancelled) {
          setCategories(categoryResponse);
          setAuthors(authorResponse);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
          setAuthors([]);
        }
      }
    }
    loadFilters();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token || isAdmin) {
      setWishlistIds(new Set());
      setFavoriteIds(new Set());
      return;
    }
    let cancelled = false;
    async function loadLists() {
      if (!token) return;
      try {
        const [wishlist, favorites] = await Promise.all([
          getWishlist(token),
          getFavorites(token)
        ]);
        if (!cancelled) {
          setWishlistIds(new Set(wishlist.map((item) => item.id)));
          setFavoriteIds(new Set(favorites.map((item) => item.id)));
        }
      } catch {
        if (!cancelled) {
          setWishlistIds(new Set());
          setFavoriteIds(new Set());
        }
      }
    }
    loadLists();
    return () => {
      cancelled = true;
    };
  }, [token, isAdmin]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTitle((currentTitle) => {
        if (currentTitle === titleInput) {
          return currentTitle;
        }
        setPage(0);
        return titleInput;
      });
    }, TITLE_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [titleInput]);

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
          categoryId: categoryParam,
          authorId: authorParam
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
  }, [page, title, categoryParam, authorParam]);

  async function onQuickAdd(bookId: number) {
    if (isAdmin) {
      showToast("Admin accounts cannot use the cart.", "error");
      return;
    }
    if (!token) {
      navigate(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    try {
      await addToCart(token, bookId, 1);
      await refreshCart();
      showToast("Item added to cart.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Add to cart failed";
      showToast(message, "error");
    }
  }

  function applyFilters(nextCategoryIdInput?: string, nextTitleInput?: string, nextAuthorIdInput?: string) {
    const categoryValue = nextCategoryIdInput ?? categoryIdInput;
    const titleValue = nextTitleInput ?? titleInput;
    const authorValue = nextAuthorIdInput ?? authorIdInput;
    setTitle(titleValue);
    setCategoryId(categoryValue);
    setAuthorId(authorValue);
    setPage(0);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  async function toggleWishlist(bookId: number) {
    if (!token) {
      navigate(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    try {
      if (wishlistIds.has(bookId)) {
        await removeFromWishlist(token, bookId);
        setWishlistIds((current) => {
          const next = new Set(current);
          next.delete(bookId);
          return next;
        });
        showToast("Removed from wishlist.", "success");
      } else {
        await addToWishlist(token, bookId);
        setWishlistIds((current) => new Set([...current, bookId]));
        showToast("Added to wishlist.", "success");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wishlist update failed";
      showToast(message, "error");
    }
  }

  async function toggleFavorite(bookId: number) {
    if (!token) {
      navigate(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    try {
      if (favoriteIds.has(bookId)) {
        await removeFromFavorites(token, bookId);
        setFavoriteIds((current) => {
          const next = new Set(current);
          next.delete(bookId);
          return next;
        });
        showToast("Removed from favorites.", "success");
      } else {
        await addToFavorites(token, bookId);
        setFavoriteIds((current) => new Set([...current, bookId]));
        showToast("Added to favorites.", "success");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Favorites update failed";
      showToast(message, "error");
    }
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
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyFilters(undefined, titleInput);
                }
              }}
              placeholder="clean code"
              size="small"
              fullWidth
            />
            <TextField
              label="Author"
              select
              value={authorIdInput}
              onChange={(event) => {
                const value = event.target.value;
                setAuthorIdInput(value);
                applyFilters(undefined, undefined, value);
              }}
              size="small"
              sx={{ minWidth: { md: 180 } }}
            >
              <MenuItem value="">All authors</MenuItem>
              {authors.map((author) => (
                <MenuItem key={author.id} value={String(author.id)}>
                  {author.name}
                </MenuItem>
              ))}
            </TextField>
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
                setAuthorIdInput("");
                setCategoryIdInput("");
                setTitle("");
                setAuthorId("");
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
            : bookItems.length === 0 && !loading
            ? (
              <Grid size={{ xs: 12 }}>
                <EmptyState
                  icon={<SearchOutlinedIcon />}
                  title="No books found"
                  description="We couldn't find any books matching your search criteria. Try adjusting your filters."
                  actionLabel="Clear Filters"
                  onAction={() => applyFilters("", "")}
                />
              </Grid>
            )
            : bookItems.map((book) => (
              <Grid key={book.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <BookCard
                  book={book}
                  isAdmin={isAdmin}
                  isWishlisted={wishlistIds.has(book.id)}
                  isFavorite={favoriteIds.has(book.id)}
                  onAddToCart={onQuickAdd}
                  onToggleWishlist={toggleWishlist}
                  onToggleFavorite={toggleFavorite}
                />
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
    </Box>
  );
}
