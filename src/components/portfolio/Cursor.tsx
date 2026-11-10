import { useEffect, useRef, useState } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '@/lib/hooks'

const SIZE_NORMAL = 28
const SIZE_ACTIVE = 64
const LAG = 0.18

/**
 * Cursor "visor de câmera" (viewfinder):
 * - ponto central de 6px segue o mouse instantaneamente;
 * - moldura com 4 cantos em L segue com atraso (lerp 0.18) em um loop de rAF;
 * - hover em elementos com data-cursor="texto" expande para 64px e mostra a etiqueta;
 * - pointerdown encolhe para 80%.
 * Só existe com ponteiro preciso e sem redução de movimento; o cursor nativo
 * continua intocado em touch. mix-blend-difference inverte contra fundos claros.
 */
export function Cursor() {
  const finePointer = useFinePointer()
  const reducedMotion = usePrefersReducedMotion()
  const dotRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [label, setLabel] = useState<string | null>(null)
  const [pressed, setPressed] = useState(false)

  const enabled = finePointer && !reducedMotion

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('custom-cursor')

    const pos = { x: -100, y: -100 }
    const lag = { x: -100, y: -100 }
    let raf = 0
    let shown = false

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      const dot = dotRef.current
      if (dot) dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      if (!shown) {
        shown = true
        lag.x = pos.x
        lag.y = pos.y
        setVisible(true)
      }
      const target = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-cursor]') : null
      setLabel(target ? (target.dataset.cursor ?? '') : null)
    }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    const loop = () => {
      lag.x += (pos.x - lag.x) * LAG
      lag.y += (pos.y - lag.y) * LAG
      const frame = frameRef.current
      if (frame) frame.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('custom-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
    }
  }, [enabled])

  if (!enabled) return null

  const active = label !== null
  const size = active ? SIZE_ACTIVE : SIZE_NORMAL
  const corner = 'absolute size-[10px] border-[#f5eedc]'

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] text-[#f5eedc] mix-blend-difference transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div ref={dotRef} className="absolute top-0 left-0 size-1.5 rounded-full bg-[#f5eedc]" />
      <div ref={frameRef} className="absolute top-0 left-0">
        <div
          className="relative transition-[width,height,scale] duration-200 ease-out"
          style={{ width: size, height: size, scale: pressed ? 0.8 : 1 }}
        >
          <span className={`${corner} top-0 left-0 border-t border-l`} />
          <span className={`${corner} top-0 right-0 border-t border-r`} />
          <span className={`${corner} bottom-0 left-0 border-b border-l`} />
          <span className={`${corner} right-0 bottom-0 border-r border-b`} />
          {active && label.length > 0 && (
            <span className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2 font-mono text-[10px] tracking-widest whitespace-nowrap uppercase">
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
