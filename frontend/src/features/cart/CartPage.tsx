import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import Paper from "@mui/material/Paper";
import RemoveShoppingCartOutlinedIcon from "@mui/icons-material/RemoveShoppingCartOutlined";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { checkout, clearCart, getCart, removeCartItem, updateCartItem } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import type { Cart } from "../../types/api";

export function CartPage() {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; severity: "success" | "error" | "info" } | null>(
    null
  );
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
      setFeedback({ message, severity: "error" });
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
      setFeedback({ message: "Item removed.", severity: "success" });
    } catch (error) {
      setCart(previousCart);
      setQuantities(previousQuantities);
      const message = error instanceof Error ? error.message : "Remove failed";
      setFeedback({ message, severity: "error" });
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
      } catch (error) {
        const message = error instanceof Error ? error.message : "Update failed";
        setFeedback({ message, severity: "error" });
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
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            Cart
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Quantities update instantly and sync in the background.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
            <Button
              type="button"
              variant="outlined"
              color="error"
              startIcon={<DeleteSweepOutlinedIcon />}
              onClick={() => setClearDialogOpen(true)}
            >
              Clear cart
            </Button>
            <Button type="button" variant="contained" startIcon={<PaidOutlinedIcon />} onClick={() => setCheckoutDialogOpen(true)}>
              Checkout
            </Button>
          </Stack>

          {loading ? (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CircularProgress size={18} />
              <Typography variant="body2">Loading cart...</Typography>
            </Stack>
          ) : null}

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <TableRow key={item.bookId}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                      <TableCell sx={{ width: 160 }}>
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 1 }}
                          value={item.quantity}
                          onChange={(event) => onQuantityInputChange(item.bookId, event.currentTarget.value)}
                        />
                      </TableCell>
                      <TableCell>${Number(item.subtotal).toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Button
                          type="button"
                          variant="outlined"
                          color="error"
                          startIcon={<RemoveShoppingCartOutlinedIcon />}
                          onClick={() => onRemoveItem(item.bookId)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">
                        No items in cart.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Chip
              color="primary"
              variant="outlined"
              label={`Total: $${calculatedTotal.toFixed(2)}`}
              sx={{ fontWeight: 700, px: 1 }}
            />
          </Stack>
        </CardContent>
      </Card>

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
                setFeedback({ message: "Cart cleared.", severity: "success" });
                await refresh();
              } catch (error) {
                const message = error instanceof Error ? error.message : "Clear cart failed";
                setFeedback({ message, severity: "error" });
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
                setFeedback({ message: "Checkout completed successfully.", severity: "success" });
                await refresh();
              } catch (error) {
                const message = error instanceof Error ? error.message : "Checkout failed";
                setFeedback({ message, severity: "error" });
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

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
