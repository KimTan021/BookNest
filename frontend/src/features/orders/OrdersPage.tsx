import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { getOrderHistory } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import type { Order } from "../../types/api";

export function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const authToken = token;
    if (!authToken) {
      return;
    }
    const tokenValue: string = authToken;
    let cancelled = false;
    async function loadOrders() {
      setLoading(true);
      setStatus("");
      try {
        const response = await getOrderHistory(tokenValue);
        if (!cancelled) {
          setOrders(response);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load order history";
          setStatus(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
            Orders
          </Typography>
          <Alert severity="info">Login first to view your order history.</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
        Order history
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Review completed checkouts with itemized details and timestamps.
      </Typography>
      {loading ? (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <CircularProgress size={18} />
          <Typography variant="body2">Loading orders...</Typography>
        </Stack>
      ) : null}
      {status ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {status}
        </Alert>
      ) : null}
      {orders.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No orders yet.
        </Alert>
      ) : null}

      <Stack spacing={2}>
        {orders.map((order) => (
          <Card key={order.orderId}>
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
                spacing={1}
                sx={{ mb: 1 }}
              >
                <Typography variant="h6" component="h2">
                  Order summary
                </Typography>
                <Chip label={order.status} color="primary" variant="outlined" />
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {new Date(order.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1.5 }}>
                Total: <strong>${Number(order.totalAmount).toFixed(2)}</strong>
              </Typography>
              <Divider sx={{ mb: 1.5 }} />

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Book</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item, idx) => (
                      <TableRow key={`${order.orderId}-${idx}`}>
                        <TableCell>{item.bookTitle}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${Number(item.price).toFixed(2)}</TableCell>
                        <TableCell align="right">${Number(item.subtotal).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
