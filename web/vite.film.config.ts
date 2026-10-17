import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// Builds the film drafts as a standalone page with relative paths, so it can be published anywhere.
const relative: Plugin = {
  name: "relative-site-paths",
  enforce: "pre",
  transform(code, id) {
    if (!/\.(css|tsx?)$/.test(id) || !code.includes("/organizy-app/")) return;
    return code.replaceAll("/organizy-app/", id.endsWith(".css") ? "../" : "./");
  },
};

export default defineConfig({
  base: "./",
  plugins: [relative, react(), tailwindcss()],
  build: { target: "es2022", assetsInlineLimit: 0, outDir: "dist-film", rollupOptions: { input: ["film-drafts.html", "film-capture.html"] } },
});
