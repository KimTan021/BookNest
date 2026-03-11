import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { getAdminMetrics } from "../../../lib/api";
import { useAuth } from "../../../state/AuthContext";
import type { AdminMetrics } from "../../../types/api";

export function AdminOverviewPage() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const metricsItems = useMemo(() => {
    if (!metrics) {
      return [];
    }
    return [
      { label: "Users", value: metrics.users },
      { label: "Books", value: metrics.books },
      { label: "Orders", value: metrics.orders },
      { label: "Categories", value: metrics.categories },
      { label: "Authors", value: metrics.authors }
    ];
  }, [metrics]);

  async function loadMetrics() {
    if (!token) {
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await getAdminMetrics(token);
      setMetrics(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load metrics";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
  }, [token]);

  return (
    <Box component="section">
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1">
          Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Snapshot of catalog and customer activity.
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Store health
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quick counts across the system.
              </Typography>
            </Box>
            <Button
              startIcon={<RefreshOutlinedIcon />}
              variant="outlined"
              onClick={loadMetrics}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>
          <Divider sx={{ my: 2 }} />
          {status ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {status}
            </Alert>
          ) : null}
          {loading ? (
            <Stack alignItems="center" sx={{ py: 3 }}>
              <CircularProgress size={28} />
            </Stack>
          ) : (
            <Grid container spacing={2}>
              {metricsItems.map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="h5">{item.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
