import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
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
    <Box component="section" className="animate-fade-in">
      <Stack spacing={0.5} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening in your store today.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Main Stats */}
        <Grid size={{ xs: 12 }}>
          <Card className="glass-card" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Store health
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total counts across the system
                  </Typography>
                </Box>
                <Button
                  startIcon={<RefreshOutlinedIcon />}
                  variant="contained"
                  onClick={loadMetrics}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  Refresh
                </Button>
              </Stack>

              {status && <Alert severity="error" sx={{ mb: 3 }}>{status}</Alert>}

              <Grid container spacing={3}>
                {loading ? (
                  <Grid size={{ xs: 12 }} sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={40} />
                  </Grid>
                ) : (
                  metricsItems.map((item) => (
                    <Grid key={item.label} size={{ xs: 6, sm: 4, md: 2.4 }}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: "rgba(25, 118, 210, 0.04)",
                        textAlign: "center"
                      }}>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution Mockup */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="glass-card" sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Inventory Distribution
              </Typography>
              <Stack spacing={3}>
                {[
                  { label: 'Fiction', value: 45, color: 'primary' },
                  { label: 'Science', value: 25, color: 'success' },
                  { label: 'History', value: 15, color: 'warning' },
                  { label: 'Other', value: 15, color: 'secondary' }
                ].map((item) => (
                  <Box key={item.label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.value}%</Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={item.value} 
                      color={item.color as any}
                      sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.05)' }} 
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity Mockup */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="glass-card" sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <Stack spacing={2} divider={<Divider />}>
                {[
                  { user: "Admin", action: "Added new book: 'The Great Gatsby'", time: "2 hours ago" },
                  { user: "System", action: "Database backup completed", time: "5 hours ago" },
                  { user: "Admin", action: "Updated category: 'Science Fiction'", time: "1 day ago" },
                  { user: "Admin", action: "Created author profile: 'J.K. Rowling'", time: "2 days ago" },
                ].map((activity, index) => (
                  <Box key={index} sx={{ py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {activity.user} <Box component="span" sx={{ fontWeight: 400, color: "text.secondary" }}>{activity.action}</Box>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

