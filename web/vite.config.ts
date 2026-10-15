import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Served from https://koschei-dev.github.io/organizy-app/
export default defineConfig({
  base: "/organizy-app/",
  plugins: [react(), tailwindcss()],
  build: { target: "es2022", assetsInlineLimit: 0 },
});
