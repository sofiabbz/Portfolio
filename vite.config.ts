import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Ordem importa: tanstackStart gera o routeTree e configura SSR; nitro empacota o
// servidor para o host (Vercel detecta e usa o preset certo); viteReact vem por último.
// Os aliases "@/..." do tsconfig são resolvidos nativamente pelo Vite 8.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
})
