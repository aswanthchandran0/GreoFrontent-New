import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: "buffer",
      process: "process/browser",
    },
  },
  define: {
    global: "globalThis",
  },
  server: {
    host: true, // 👈 REQUIRED for mobile access
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
