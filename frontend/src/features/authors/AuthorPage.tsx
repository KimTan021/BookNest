import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { getAuthor } from "../../lib/api";
import type { AuthorDetails } from "../../types/api";

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
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
                {author.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {author.bio || "Author biography is not available yet."}
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Books by {author.name}
          </Typography>
          <Grid container spacing={2}>
            {author.books.map((book) => (
              <Grid key={book.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardMedia
                    component="img"
                    height="220"
                    image={book.imageUrl || "https://placehold.co/300x420?text=Book"}
                    alt={book.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${Number(book.price).toFixed(2)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={Link}
                      to={`/books/${book.id}`}
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityOutlinedIcon />}
                    >
                      View book
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : null}
    </Box>
  );
}
