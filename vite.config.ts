import { env } from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import mkcert from "vite-plugin-mkcert";
import framer from "vite-plugin-framer";
import tanstackRouterPlugin from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouterPlugin(),
    react(),
    ...(env.NO_MKCERT === "true" ? [] : [mkcert()]),
    framer(),
  ],
  build: {
    target: "ES2022",
    modulePreload: { polyfill: false },
  },
});
