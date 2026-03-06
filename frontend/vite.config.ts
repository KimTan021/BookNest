import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "@emotion/react",
      "@emotion/styled",
      "@mui/material/Alert",
      "@mui/material/Box",
      "@mui/material/Button",
      "@mui/material/Card",
      "@mui/material/CardContent",
      "@mui/material/Snackbar",
      "@mui/material/Stack",
      "@mui/material/TextField",
      "@mui/material/Typography"
    ]
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8082",
        changeOrigin: true
      }
    }
  }
});
