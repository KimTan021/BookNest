import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
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
import Paper from "@mui/material/Paper";
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
  const [status, setStatus] = useState("");
  const [statusSeverity, setStatusSeverity] = useState<"success" | "error" | "info">("info");
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
      setStatus(message);
      setStatusSeverity("error");
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

  function onQuantityInputChange(bookId: number, rawValue: string) {
    const authToken = token;
    if (!authToken) {
      return;
    }

    const parsed = Number(rawValue);
    const nextQuantity = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);

    setQuantities((prev) => ({ ...prev, [bookId]: nextQuantity }));
    setStatus("");

    const previousTimer = quantityUpdateTimers.current[bookId];
    if (previousTimer) {
      window.clearTimeout(previousTimer);
    }

    quantityUpdateTimers.current[bookId] = window.setTimeout(async () => {
      try {
        await updateCartItem(authToken, bookId, nextQuantity);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Update failed";
        setStatus(message);
        setStatusSeverity("error");
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
            <Button type="button" variant="outlined" color="error" onClick={() => setClearDialogOpen(true)}>
              Clear cart
            </Button>
            <Button type="button" variant="contained" onClick={() => setCheckoutDialogOpen(true)}>
              Checkout
            </Button>
          </Stack>

          {loading ? (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CircularProgress size={18} />
              <Typography variant="body2">Loading cart...</Typography>
            </Stack>
          ) : null}
          {status ? (
            <Alert severity={statusSeverity} sx={{ mb: 2 }}>
              {status}
            </Alert>
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
                          onClick={async () => {
                            try {
                              await removeCartItem(token, item.bookId);
                              setStatus("Item removed.");
                              setStatusSeverity("success");
                              await refresh();
                            } catch (error) {
                              const message = error instanceof Error ? error.message : "Remove failed";
                              setStatus(message);
                              setStatusSeverity("error");
                            }
                          }}
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

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear cart</DialogTitle>
        <DialogContent>
          <DialogContentText>Remove all items from your cart?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={async () => {
              setClearDialogOpen(false);
              try {
                await clearCart(token);
                setStatus("Cart cleared.");
                setStatusSeverity("success");
                await refresh();
              } catch (error) {
                const message = error instanceof Error ? error.message : "Clear cart failed";
                setStatus(message);
                setStatusSeverity("error");
              }
            }}
          >
            Clear
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={checkoutDialogOpen} onClose={() => setCheckoutDialogOpen(false)}>
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          <DialogContentText>Proceed to checkout with current cart items?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setCheckoutDialogOpen(false);
              try {
                const order = await checkout(token);
                setStatus(`Checkout completed. Order #${order.orderId}`);
                setStatusSeverity("success");
                await refresh();
              } catch (error) {
                const message = error instanceof Error ? error.message : "Checkout failed";
                setStatus(message);
                setStatusSeverity("error");
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
