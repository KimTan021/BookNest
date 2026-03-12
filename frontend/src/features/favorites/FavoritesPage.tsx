import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BookCard } from "../../components/BookCard";
import { EmptyState } from "../../components/EmptyState";
import { addToCart, getFavorites, removeFromFavorites } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import { useCart } from "../../state/CartContext";
import { useToast } from "../../state/ToastContext";
import type { Book } from "../../types/api";

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    async function loadFavorites() {
      if (!token) {
        setFavorites([]);
        return;
      }
      setLoading(true);
      try {
        const response = await getFavorites(token);
        if (!cancelled) {
          setFavorites(response);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load favorites";
          showToast(message, "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [token, showToast]);

  async function onAddToCart(bookId: number) {
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

  async function onRemove(bookId: number) {
    if (!token) {
      return;
    }
    try {
      await removeFromFavorites(token, bookId);
      setFavorites((current) => current.filter((book) => book.id !== bookId));
      showToast("Removed from favorites.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove from favorites";
      showToast(message, "error");
    }
  }

  return (
    <Box component="section">
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" component="h1">
            Favorites
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The books you love the most.
          </Typography>
        </Box>
      </Stack>

      {loading ? (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Loading favorites...
          </Typography>
        </Stack>
      ) : null}

      {!loading && favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Mark books as favorites to keep them handy."
          actionLabel="Browse books"
          onAction={() => navigate("/")}
        />
      ) : (
        <Grid container spacing={2}>
          {favorites.map((book) => (
            <Grid key={book.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <BookCard
                book={book}
                isFavorite={true}
                onAddToCart={onAddToCart}
                onRemove={onRemove}
                showRemove={true}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
