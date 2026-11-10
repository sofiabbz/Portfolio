import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// O TanStack Start chama getRouter() tanto no servidor (SSR) quanto no cliente.
// scrollRestoration fica desligado porque o Lenis e o sumário controlam o scroll.
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: false,
    defaultPreload: 'intent',
  })
}
