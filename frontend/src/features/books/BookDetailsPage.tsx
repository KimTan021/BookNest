import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { addToCart, getBook } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import type { Book } from "../../types/api";

export function BookDetailsPage() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const [statusSeverity, setStatusSeverity] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const parsedId = Number(id);
    if (!parsedId || Number.isNaN(parsedId)) {
      setStatus("Invalid book id in route.");
      return;
    }

    let cancelled = false;
    async function loadBook() {
      setLoading(true);
      setStatus("");
      try {
        const response = await getBook(parsedId);
        if (!cancelled) {
          setBook(response);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load book";
          setStatus(message);
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
      setStatus("Login is required before adding items to cart.");
      setStatusSeverity("error");
      return;
    }

    try {
      await addToCart(token, book.id, quantity);
      setStatus(`Added ${quantity} copy/copies of "${book.title}" to cart.`);
      setStatusSeverity("success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Add to cart failed";
      setStatus(message);
      setStatusSeverity("error");
    }
  }

  return (
    <Box component="section">
      <Button component={Link} to="/" variant="text" sx={{ mb: 1 }}>
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
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
              <CardMedia
                component="img"
                image={book.imageUrl || "https://placehold.co/340x500?text=Book"}
                alt={book.title}
                sx={{
                  width: { xs: "100%", md: 320 },
                  maxWidth: 360,
                  borderRadius: 3,
                  objectFit: "cover"
                }}
              />

              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" component="h1" sx={{ mb: 0.5 }}>
                  {book.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {book.authorName}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
                  <Chip label={`Category: ${book.categoryName}`} variant="outlined" />
                  <Chip label={`Stock: ${book.stock}`} color={book.stock > 0 ? "success" : "default"} />
                </Stack>

                <Typography variant="h5" color="primary" sx={{ mb: 1.5 }}>
                  ${Number(book.price).toFixed(2)}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5 }}>
                  {book.description}
                </Typography>

                <Stack component="form" direction={{ xs: "column", sm: "row" }} spacing={1.25} onSubmit={onAddToCart}>
                  <TextField
                    label="Quantity"
                    size="small"
                    type="number"
                    inputProps={{ min: 1, max: book.stock }}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                    sx={{ width: { xs: "100%", sm: 130 } }}
                  />
                  <Button type="submit" variant="contained" disabled={book.stock <= 0}>
                    Add to cart
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {status ? (
        <Alert severity={statusSeverity} sx={{ mt: 2 }}>
          {status}
        </Alert>
      ) : null}
    </Box>
  );
}
