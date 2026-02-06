import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/auth": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/certs": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/advisory": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/audit": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
