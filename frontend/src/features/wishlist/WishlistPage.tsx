import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BookCard } from "../../components/BookCard";
import { EmptyState } from "../../components/EmptyState";
import { addToCart, getWishlist, removeFromWishlist } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import { useCart } from "../../state/CartContext";
import { useToast } from "../../state/ToastContext";
import type { Book } from "../../types/api";

export function WishlistPage() {
  const [wishlist, setWishlist] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    async function loadWishlist() {
      if (!token) {
        setWishlist([]);
        return;
      }
      setLoading(true);
      try {
        const response = await getWishlist(token);
        if (!cancelled) {
          setWishlist(response);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load wishlist";
          showToast(message, "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadWishlist();
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
      await removeFromWishlist(token, bookId);
      setWishlist((current) => current.filter((book) => book.id !== bookId));
      showToast("Removed from wishlist.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove from wishlist";
      showToast(message, "error");
    }
  }

  return (
    <Box component="section">
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" component="h1">
            Wishlist
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Books you want to revisit later.
          </Typography>
        </Box>
        {wishlist.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddShoppingCartOutlinedIcon />}
            onClick={async () => {
              try {
                await Promise.all(wishlist.map((book) => addToCart(token!, book.id, 1)));
                await refreshCart();
                showToast("All items moved to cart.", "success");
              } catch (error) {
                showToast("Failed to move some items to cart.", "error");
              }
            }}
          >
            Move all to cart
          </Button>
        )}
      </Stack>

      {loading ? (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Loading wishlist...
          </Typography>
        </Stack>
      ) : null}

      {!loading && wishlist.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save books you want to revisit later."
          actionLabel="Browse books"
          onAction={() => navigate("/")}
        />
      ) : (
        <Grid container spacing={2}>
          {wishlist.map((book) => (
            <Grid key={book.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <BookCard
                book={book}
                isWishlisted={true}
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
