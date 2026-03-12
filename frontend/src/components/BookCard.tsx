import { Link } from "react-router-dom";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { Book } from "../types/api";

interface BookCardProps {
  book: Book;
  isWishlisted?: boolean;
  isFavorite?: boolean;
  isAdmin?: boolean;
  onAddToCart?: (bookId: number) => void;
  onToggleWishlist?: (bookId: number) => void;
  onToggleFavorite?: (bookId: number) => void;
  onRemove?: (bookId: number) => void;
  showRemove?: boolean;
}

export function BookCard({
  book,
  isWishlisted,
  isFavorite,
  isAdmin,
  onAddToCart,
  onToggleWishlist,
  onToggleFavorite,
  onRemove,
  showRemove = false,
}: BookCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          pt: "135%",
          position: "relative",
          bgcolor: "rgba(0,0,0,0.02)",
          overflow: "hidden",
        }}
      >
        <CardMedia
          component="img"
          image={book.imageUrl || "https://placehold.co/300x420?text=Book"}
          alt={book.title}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            p: 2,
            transition: "transform 0.5s ease",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: "1rem",
            mb: 0.5,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "2.5rem",
          }}
        >
          {book.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            "& a": {
              textDecoration: "none",
              color: "inherit",
              "&:hover": {
                color: "primary.main",
                textDecoration: "underline",
              },
            },
          }}
        >
          {book.authorId ? (
            <Link to={`/authors/${book.authorId}`}>{book.authorName}</Link>
          ) : (
            book.authorName || "Unknown author"
          )}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
          ${Number(book.price).toFixed(2)}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Button
            component={Link}
            to={`/books/${book.id}`}
            variant="outlined"
            size="small"
            sx={{ minWidth: 0, px: 1.5 }}
          >
            Details
          </Button>
          {!isAdmin && onAddToCart && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddShoppingCartOutlinedIcon />}
              onClick={() => onAddToCart(book.id)}
            >
              Add
            </Button>
          )}
          {isAdmin && (
            <Button
              component={Link}
              to="/admin/books"
              variant="contained"
              size="small"
            >
              Manage
            </Button>
          )}
        </Box>

        {!isAdmin && (
          <Box sx={{ display: "flex", gap: 0.25 }}>
            {onToggleFavorite && (
              <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                <IconButton
                  size="small"
                  color={isFavorite ? "error" : "default"}
                  onClick={() => onToggleFavorite(book.id)}
                >
                  {isFavorite ? <FavoriteRoundedIcon fontSize="small" /> : <FavoriteBorderOutlinedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}
            {onToggleWishlist && (
              <Tooltip title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}>
                <IconButton
                  size="small"
                  color={isWishlisted ? "primary" : "default"}
                  onClick={() => onToggleWishlist(book.id)}
                >
                  {isWishlisted ? <BookmarkRoundedIcon fontSize="small" /> : <BookmarkBorderOutlinedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}
            {showRemove && onRemove && (
              <Tooltip title="Remove">
                <IconButton
                  size="small"
                  onClick={() => onRemove(book.id)}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </CardActions>
    </Card>
  );
}
