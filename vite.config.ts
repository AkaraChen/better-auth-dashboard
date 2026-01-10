import { paraglideVitePlugin } from '@inlang/paraglide-js'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [paraglideVitePlugin({ project: './project.inlang', outdir: './src/paraglide' }),react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~": __dirname,
    },
  },
  define: {
    'import.meta.env.VITE_BASENAME': JSON.stringify(process.env.VITE_BASENAME || ''),
  }
})