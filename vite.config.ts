import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Ordem importa: tanstackStart gera o routeTree e configura SSR; viteReact vem por último.
// Os aliases "@/..." do tsconfig são resolvidos nativamente pelo Vite 8.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
})
