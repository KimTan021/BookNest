import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BookCard } from "../../components/BookCard";
import { getAuthor } from "../../lib/api";
import type { AuthorDetails, Book } from "../../types/api";

export function AuthorPage() {
  const { id } = useParams();
  const [author, setAuthor] = useState<AuthorDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const parsedId = Number(id);
    if (!parsedId || Number.isNaN(parsedId)) {
      setStatus("Invalid author id in route.");
      return;
    }

    let cancelled = false;
    async function loadAuthor() {
      setLoading(true);
      setStatus("");
      try {
        const response = await getAuthor(parsedId);
        if (!cancelled) {
          setAuthor(response);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load author";
          setStatus(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAuthor();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <Box component="section">
      <Button component={Link} to="/" variant="text" startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 1 }}>
        Back to catalog
      </Button>

      {loading ? (
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Loading author details...
          </Typography>
        </Stack>
      ) : null}

      {status ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {status}
        </Alert>
      ) : null}

      {author ? (
        <>
          <Card sx={{ mb: 4, borderRadius: 3, overflow: "hidden" }} className="glass-card">
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
                {author.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}>
                {author.bio || "Author biography is not available yet."}
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Books by {author.name}
          </Typography>
          <Grid container spacing={3}>
            {author.books.map((book) => (
              <Grid key={book.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <BookCard
                  book={book as Book}
                  onAddToCart={(bookId: number) => {
                    // Navigate to details for cart action in AuthorPage context
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </>
      ) : null}
    </Box>
  );
}
