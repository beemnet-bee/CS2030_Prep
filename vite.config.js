import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" makes every asset path relative, so the built site works
// on GitHub Pages, Netlify, Vercel, or any static host without config.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
