import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

// Config separada do vite.config.ts de propósito: o plugin do TanStack Start
// faz SSR e geração de rotas, o que não é necessário (e atrapalha) em testes unitários.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [viteReact()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
