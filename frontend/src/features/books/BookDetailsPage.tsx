import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { addToCart, addToFavorites, addToWishlist, getBook, getFavorites, getWishlist, removeFromFavorites, removeFromWishlist } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import type { Book } from "../../types/api";
import { useNavigate } from "react-router-dom";

export function BookDetailsPage() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<{ message: string; severity: "success" | "error" | "info" } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const parsedId = Number(id);
    if (!parsedId || Number.isNaN(parsedId)) {
      setFeedback({ message: "Invalid book id in route.", severity: "error" });
      return;
    }

    let cancelled = false;
    async function loadBook() {
      setLoading(true);
      try {
        const response = await getBook(parsedId);
        if (!cancelled) {
          setBook(response);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load book";
          setFeedback({ message, severity: "error" });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadBook();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!token || !book || isAdmin) {
      setIsWishlisted(false);
      setIsFavorite(false);
      return;
    }
    let cancelled = false;
    async function loadFlags() {
      if (!token || !book) return;
      try {
        const [wishlist, favorites] = await Promise.all([
          getWishlist(token),
          getFavorites(token)
        ]);
        if (!cancelled) {
          setIsWishlisted(wishlist.some((item) => item.id === book.id));
          setIsFavorite(favorites.some((item) => item.id === book.id));
        }
      } catch {
        if (!cancelled) {
          setIsWishlisted(false);
          setIsFavorite(false);
        }
      }
    }
    loadFlags();
    return () => {
      cancelled = true;
    };
  }, [token, book, isAdmin]);

  async function onAddToCart(event: FormEvent) {
    event.preventDefault();
    if (!book) {
      return;
    }
    if (!token) {
      setFeedback({ message: "Login is required before adding items to cart.", severity: "error" });
      return;
    }

    try {
      await addToCart(token, book.id, quantity);
      setFeedback({ message: "Item added to cart.", severity: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Add to cart failed";
      setFeedback({ message, severity: "error" });
    }
  }

  async function onBuyNow() {
    if (!book) {
      return;
    }
    if (!token) {
      setFeedback({ message: "Login is required before buying this book.", severity: "error" });
      return;
    }

    try {
      await addToCart(token, book.id, quantity);
      navigate("/cart");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Buy now failed";
      setFeedback({ message, severity: "error" });
    }
  }

  async function toggleWishlist() {
    if (!book) {
      return;
    }
    if (!token) {
      setFeedback({ message: "Login is required before saving to wishlist.", severity: "error" });
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(token, book.id);
        setIsWishlisted(false);
        setFeedback({ message: "Removed from wishlist.", severity: "success" });
      } else {
        await addToWishlist(token, book.id);
        setIsWishlisted(true);
        setFeedback({ message: "Added to wishlist.", severity: "success" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wishlist update failed";
      setFeedback({ message, severity: "error" });
    }
  }

  async function toggleFavorite() {
    if (!book) {
      return;
    }
    if (!token) {
      setFeedback({ message: "Login is required before adding favorites.", severity: "error" });
      return;
    }
    try {
      if (isFavorite) {
        await removeFromFavorites(token, book.id);
        setIsFavorite(false);
        setFeedback({ message: "Removed from favorites.", severity: "success" });
      } else {
        await addToFavorites(token, book.id);
        setIsFavorite(true);
        setFeedback({ message: "Added to favorites.", severity: "success" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Favorites update failed";
      setFeedback({ message, severity: "error" });
    }
  }

  return (
    <Box component="section">
      <Button component={Link} to="/" variant="text" startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 1 }}>
        Back to catalog
      </Button>

      {loading ? (
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Loading book details...
          </Typography>
        </Stack>
      ) : null}

      {!loading && book ? (
        <Card>
          <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2.5, md: 4 }}>
              <CardMedia
                component="img"
                image={book.imageUrl || "https://placehold.co/340x500?text=Book"}
                alt={book.title}
                sx={{
                  width: { xs: "100%", md: 320 },
                  maxWidth: 360,
                  borderRadius: 3,
                  objectFit: "cover",
                  alignSelf: { md: "flex-start" }
                }}
              />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h5" component="h1" sx={{ mb: 0.75 }}>
                  {book.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2.25 }}>
                  {book.authorId ? (
                    <Link to={`/authors/${book.authorId}`} style={{ textDecoration: "none", color: "inherit" }}>
                      {book.authorName}
                    </Link>
                  ) : (
                    book.authorName
                  )}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
                  <Chip label={`Category: ${book.categoryName}`} variant="outlined" />
                  <Chip label={`Stock: ${book.stock}`} color={book.stock > 0 ? "success" : "default"} />
                </Stack>

                <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                  ${Number(book.price).toFixed(2)}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
                  {book.description}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {isAdmin ? (
                  <Stack spacing={2}>
                    <Alert severity="info" variant="outlined">
                      You are viewing this book as an Admin. Edit this listing from the Admin Dashboard.
                    </Alert>
                    <Button
                      component={Link}
                      to={`/admin/books?edit=${book.id}`}
                      variant="contained"
                      sx={{ width: { xs: "100%", sm: "auto" }, alignSelf: "flex-start" }}
                    >
                      Manage book
                    </Button>
                  </Stack>
                ) : (
                  <Stack
                    component="form"
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ sm: "center" }}
                    onSubmit={onAddToCart}
                  >
                    <TextField
                      label="Quantity"
                      size="small"
                      type="number"
                      inputProps={{ min: 1, max: book.stock }}
                      value={quantity}
                      onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                      sx={{ width: { xs: "100%", sm: 140 } }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<ShoppingCartOutlinedIcon />}
                      disabled={book.stock <= 0}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      Add to cart
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      startIcon={<BoltOutlinedIcon />}
                      disabled={book.stock <= 0}
                      onClick={onBuyNow}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      Buy now
                    </Button>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                        <IconButton color={isFavorite ? "error" : "default"} onClick={toggleFavorite}>
                          {isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderOutlinedIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}>
                        <IconButton color={isWishlisted ? "primary" : "default"} onClick={toggleWishlist}>
                          {isWishlisted ? <BookmarkRoundedIcon /> : <BookmarkBorderOutlinedIcon />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={2200}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setFeedback(null)} severity={feedback?.severity ?? "info"} variant="filled">
          {feedback?.message ?? ""}
        </Alert>
      </Snackbar>
    </Box>
  );
}
