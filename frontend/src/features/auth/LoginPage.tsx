import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { login } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [status, setStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const { setAuthToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = (location.state as { from?: string } | undefined)?.from ?? "/";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    try {
      const response = await login(form);
      setAuthToken(response.accessToken, response.expiresInSeconds);
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 460 }}>
      <Card>
        <CardContent>
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Login
          </Typography>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
              label="Email"
              autoComplete="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Password"
              autoComplete="current-password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
            {status ? <Alert severity="error">{status}</Alert> : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
