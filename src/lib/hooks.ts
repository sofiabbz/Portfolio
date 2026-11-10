import { useEffect, useState, useSyncExternalStore } from 'react'

// Hooks que dependem do navegador. Todos devolvem um valor estável no SSR
// (false/null) e só atualizam depois do mount, evitando mismatch de hidratação.

function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    if (typeof window === 'undefined') return () => {}
    const mql = window.matchMedia(query)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }
  const getSnapshot = () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches)
  const getServerSnapshot = () => false
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function useFinePointer(): boolean {
  return useMediaQuery('(pointer: fine)')
}

/** true apenas depois da hidratação. Útil para adiar relógio, canvas etc. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

/**
 * Observa se um elemento entrou na viewport (uma única vez).
 * Recebe um ref de um WRAPPER não recortado: observar um elemento com clip-path
 * totalmente recortado pode impedir o IntersectionObserver de disparar.
 */
export function useInViewOnce<T extends Element>(
  ref: React.RefObject<T | null>,
  options?: IntersectionObserverInit,
): boolean {
  const [inView, setInView] = useState(false)
  const rootMargin = options?.rootMargin ?? '0px 0px -10% 0px'
  const threshold = options?.threshold ?? 0.15

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, inView, rootMargin, threshold])

  return inView
}
