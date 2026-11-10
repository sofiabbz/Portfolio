import { useEffect, useRef, useState, type ElementType } from 'react'
import { useInViewOnce, usePrefersReducedMotion } from '@/lib/hooks'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#░▒▓'

interface ScrambleTextProps {
  text: string
  as?: ElementType
  className?: string
  /** Duração total em ms. */
  duration?: number
}

/**
 * Decodifica o texto de glifos aleatórios para o texto real quando entra na
 * viewport. O texto final é sempre o mesmo e acessível (aria-label).
 */
export function ScrambleText({ text, as: Tag = 'span', className, duration = 700 }: ScrambleTextProps) {
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInViewOnce(ref)
  const reducedMotion = usePrefersReducedMotion()
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    if (!inView || reducedMotion) {
      setDisplay(text)
      return
    }
    let frame = 0
    const startedAt = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      // Letras à esquerda "resolvem" primeiro
      const resolved = Math.floor(progress * text.length)
      let next = ''
      for (let i = 0; i < text.length; i += 1) {
        const ch = text.charAt(i)
        if (i < resolved || ch === ' ') next += ch
        else next += GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length))
      }
      setDisplay(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
      else setDisplay(text)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, reducedMotion, text, duration])

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </Tag>
  )
}
