import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: "buffer", // Alias for Buffer
      process: "process/browser", // Alias for process
    },
  },
  define: {
    global: "globalThis", // Define global for browser
  },
});
