import Lenis from 'lenis'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { TOP_BAR_OFFSET } from '@/content/navigation'
import { usePrefersReducedMotion } from '@/lib/hooks'

interface SmoothScrollContextValue {
  /** Rola até um id de seção (sem "#") ou até um elemento, compensando a barra fixa. */
  scrollTo: (target: string | HTMLElement | number, options?: { immediate?: boolean }) => void
  /** Pausa o scroll da página (modais abertos). */
  stop: () => void
  /** Retoma o scroll. */
  start: () => void
}

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null)

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    // Com redução de movimento o scroll nativo é suficiente (e mais previsível)
    if (reducedMotion) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Lenis recebe autoRaf: false; nós controlamos o loop para poder limpá-lo
      autoRaf: false,
    })
    lenisRef.current = lenis

    let frame = 0
    const loop = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reducedMotion])

  const scrollTo = useCallback<SmoothScrollContextValue['scrollTo']>((target, options) => {
    const el = typeof target === 'string' ? document.getElementById(target) : target
    if (el === null) return

    const lenis = lenisRef.current
    if (lenis) {
      lenis.scrollTo(el, { offset: -TOP_BAR_OFFSET, immediate: options?.immediate ?? false })
      return
    }

    // Fallback nativo (reduced motion ou Lenis ainda não montado)
    const top = typeof el === 'number' ? el : el.getBoundingClientRect().top + window.scrollY - TOP_BAR_OFFSET
    window.scrollTo({ top, behavior: 'auto' })
  }, [])

  const stop = useCallback(() => {
    lenisRef.current?.stop()
    document.documentElement.style.overflow = 'hidden'
  }, [])

  const start = useCallback(() => {
    document.documentElement.style.overflow = ''
    lenisRef.current?.start()
  }, [])

  const value = useMemo(() => ({ scrollTo, stop, start }), [scrollTo, stop, start])

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>
}

export function useSmoothScroll(): SmoothScrollContextValue {
  const ctx = useContext(SmoothScrollContext)
  if (!ctx) throw new Error('useSmoothScroll precisa estar dentro de <SmoothScroll>')
  return ctx
}
