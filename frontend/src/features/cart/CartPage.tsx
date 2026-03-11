import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "@mui/material/Alert";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import Paper from "@mui/material/Paper";
import RemoveShoppingCartOutlinedIcon from "@mui/icons-material/RemoveShoppingCartOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { EmptyState } from "../../components/EmptyState";
import { checkout, clearCart, getCart, removeCartItem, updateCartItem } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import { useCart } from "../../state/CartContext";
import { useToast } from "../../state/ToastContext";
import type { Cart } from "../../types/api";

export function CartPage() {
  const { token } = useAuth();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const quantityUpdateTimers = useRef<Record<number, number>>({});

  const refresh = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const response = await getCart(token);
      setCart(response);
      const nextQuantities: Record<number, number> = {};
      response.items.forEach((item) => {
        nextQuantities[item.bookId] = item.quantity;
      });
      setQuantities(nextQuantities);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load cart";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    return () => {
      Object.values(quantityUpdateTimers.current).forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  const cartItems = useMemo(() => {
    return (cart?.items ?? []).map((item) => {
      const quantity = quantities[item.bookId] ?? item.quantity;
      const subtotal = Number(item.price) * quantity;
      return { ...item, quantity, subtotal };
    });
  }, [cart, quantities]);

  const calculatedTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }, [cartItems]);

  async function onRemoveItem(bookId: number) {
    if (!token || !cart) {
      return;
    }

    const previousCart = cart;
    const previousQuantities = quantities;

    setCart((current) =>
      current
        ? {
            ...current,
            items: current.items.filter((item) => item.bookId !== bookId)
          }
        : current
    );
    setQuantities((current) => {
      const next = { ...current };
      delete next[bookId];
      return next;
    });

    try {
      await removeCartItem(token, bookId);
      await refreshCart();
      showToast("Item removed.", "success");
    } catch (error) {
      setCart(previousCart);
      setQuantities(previousQuantities);
      const message = error instanceof Error ? error.message : "Remove failed";
      showToast(message, "error");
    }
  }

  function onQuantityInputChange(bookId: number, rawValue: string) {
    const authToken = token;
    if (!authToken) {
      return;
    }

    const parsed = Number(rawValue);
    const nextQuantity = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);

    setQuantities((prev) => ({ ...prev, [bookId]: nextQuantity }));

    const previousTimer = quantityUpdateTimers.current[bookId];
    if (previousTimer) {
      window.clearTimeout(previousTimer);
    }

    quantityUpdateTimers.current[bookId] = window.setTimeout(async () => {
      try {
        await updateCartItem(authToken, bookId, nextQuantity);
        await refreshCart();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Update failed";
        showToast(message, "error");
        await refresh();
      }
    }, 450);
  }

  if (!token) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
            Cart
          </Typography>
          <Alert severity="info">Login first to view and modify your cart.</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        Shopping Cart
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your items before checkout.
      </Typography>

      {loading && !cart ? (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <CircularProgress size={18} />
          <Typography variant="body2">Loading cart...</Typography>
        </Stack>
      ) : cartItems.length === 0 ? (
        <EmptyState
          icon={<ShoppingBagOutlinedIcon />}
          title="Your cart is empty"
          description="Looks like you haven't added any books yet."
          actionLabel="Start Shopping"
          onAction={() => window.location.assign("/")}
        />
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.bookId}>
                      <TableCell>
                        <Typography component={Link} to={`/books/${item.bookId}`} sx={{ textDecoration: "none", color: "inherit", fontWeight: 500 }}>
                          {item.title}
                        </Typography>
                      </TableCell>
                      <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ bgcolor: "background.default", p: 0.5, borderRadius: 1, border: "1px solid", borderColor: "divider", width: "fit-content", mx: "auto" }}>
                          <IconButton size="small" onClick={() => onQuantityInputChange(item.bookId, String(item.quantity - 1))} disabled={item.quantity <= 1}>
                            <RemoveOutlinedIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ width: 28, textAlign: "center", fontWeight: 600 }}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => onQuantityInputChange(item.bookId, String(item.quantity + 1))}>
                            <AddOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>${Number(item.subtotal).toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => onRemoveItem(item.bookId)}
                          size="small"
                        >
                          <RemoveShoppingCartOutlinedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              type="button"
              variant="outlined"
              color="error"
              startIcon={<DeleteSweepOutlinedIcon />}
              onClick={() => setClearDialogOpen(true)}
              sx={{ mb: 2 }}
            >
              Clear cart
            </Button>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined" sx={{ position: "sticky", top: 100 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Order Summary</Typography>
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Items</Typography>
                    <Typography>{cartItems.length}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography>${calculatedTotal.toFixed(2)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Shipping</Typography>
                    <Typography color="success.main">Free</Typography>
                  </Stack>
                  <Box sx={{ pt: 1.5, borderTop: "1px dashed", borderColor: "divider" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                        ${calculatedTotal.toFixed(2)}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
                <Button 
                  type="button" 
                  variant="contained" 
                  size="large"
                  fullWidth 
                  startIcon={<PaidOutlinedIcon />} 
                  onClick={() => setCheckoutDialogOpen(true)}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        PaperProps={{
          sx: (theme) => ({
            backgroundColor: theme.palette.mode === "dark" ? "#1f2024" : "#ffffff",
            backdropFilter: "none",
            border: `1px solid ${theme.palette.divider}`
          })
        }}
      >
        <DialogTitle>Clear cart</DialogTitle>
        <DialogContent>
          <DialogContentText>Remove all items from your cart?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            startIcon={<DeleteSweepOutlinedIcon />}
            onClick={async () => {
              setClearDialogOpen(false);
              try {
                await clearCart(token);
                await refreshCart();
                showToast("Cart cleared.", "success");
                await refresh();
              } catch (error) {
                const message = error instanceof Error ? error.message : "Clear cart failed";
                showToast(message, "error");
              }
            }}
          >
            Clear
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={checkoutDialogOpen}
        onClose={() => setCheckoutDialogOpen(false)}
        PaperProps={{
          sx: (theme) => ({
            backgroundColor: theme.palette.mode === "dark" ? "#1f2024" : "#ffffff",
            backdropFilter: "none",
            border: `1px solid ${theme.palette.divider}`
          })
        }}
      >
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          <DialogContentText>Proceed to checkout with current cart items?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<PaidOutlinedIcon />}
            onClick={async () => {
              setCheckoutDialogOpen(false);
              try {
                await checkout(token);
                await refreshCart();
                showToast("Checkout completed successfully.", "success");
                await refresh();
              } catch (error) {
                const message = error instanceof Error ? error.message : "Checkout failed";
                showToast(message, "error");
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
