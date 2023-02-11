import { defineConfig } from "vite";
import { resolve } from "path";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");
export default defineConfig({
  root,
  base: "/scape/",
  plugins: [],
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        _main: resolve(root, "index.html"),
        settings: resolve(root, "settings.html"),
        game: resolve(root, "game.html"),
        test: resolve(root, "test.html"),
      },
    },
  },
});
