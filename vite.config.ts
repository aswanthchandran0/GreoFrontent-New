import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    react(),
    mkcert()
  ],
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
    host: true,
    port: 5173,
    https: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      // 👇 CRITICAL: Add Socket.IO WebSocket proxy
      "/socket.io": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        ws: true, // This enables WebSocket proxy
      },
    },
  },
});