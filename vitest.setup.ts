import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// jsdom não implementa matchMedia; os componentes consultam prefers-reduced-motion
// e pointer:fine, então fornecemos um stub que responde "não" para tudo.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

// jsdom não tem ResizeObserver/IntersectionObserver (Lenis e os hooks de viewport usam).
class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
if (typeof globalThis.ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', { writable: true, value: ObserverStub })
}
if (typeof globalThis.IntersectionObserver === 'undefined') {
  Object.defineProperty(globalThis, 'IntersectionObserver', { writable: true, value: ObserverStub })
}

// Elementos chamam scrollIntoView (palette/galeria) e scrollTo (autoscroll do terminal).
if (typeof Element !== 'undefined' && typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = vi.fn()
}
if (typeof Element !== 'undefined' && typeof Element.prototype.scrollTo !== 'function') {
  Element.prototype.scrollTo = vi.fn()
}
