import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { register } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const initialForm: RegisterForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: ""
};

export function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { setAuthToken } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    try {
      const response = await register(form);
      setAuthToken(response.accessToken, response.expiresInSeconds);
      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
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
            Create account
          </Typography>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
              label="First name"
              value={form.firstName}
              onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Last name"
              value={form.lastName}
              onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Password (min 6 chars)"
              type="password"
              inputProps={{ minLength: 6 }}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </Button>
            {status ? <Alert severity="error">{status}</Alert> : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
