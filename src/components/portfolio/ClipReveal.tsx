import { useRef, type ReactNode } from 'react'
import { useInViewOnce, usePrefersReducedMotion } from '@/lib/hooks'
import { cn } from '@/lib/utils'

type Direction = 'left' | 'right' | 'up'

interface ClipRevealProps {
  children: ReactNode
  direction?: Direction
  className?: string
  delay?: number
}

const hidden: Record<Direction, string> = {
  left: 'inset(0 100% 0 0)',
  right: 'inset(0 0 0 100%)',
  up: 'inset(100% 0 0 0)',
}

/**
 * Wipe por clip-path. O IntersectionObserver observa o WRAPPER externo
 * (não recortado): um elemento 100% recortado pode nunca "intersectar".
 */
export function ClipReveal({ children, direction = 'left', className, delay = 0 }: ClipRevealProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const inView = useInViewOnce(wrapperRef)
  const reducedMotion = usePrefersReducedMotion()
  const shown = inView || reducedMotion

  return (
    <div ref={wrapperRef} className={className}>
      <div
        className={cn('transition-[clip-path] duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)]')}
        style={{
          clipPath: shown ? 'inset(0 0 0 0)' : hidden[direction],
          transitionDelay: `${delay}ms`,
          transitionDuration: reducedMotion ? '0ms' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}
