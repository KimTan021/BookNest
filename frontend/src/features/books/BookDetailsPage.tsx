import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { addToCart, getBook } from "../../lib/api";
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
  const { token } = useAuth();
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
                </Stack>
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
