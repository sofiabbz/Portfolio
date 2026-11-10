import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ui } from '@/content/ui'
import { usePrefersReducedMotion } from '@/lib/hooks'
import { useSmoothScroll } from './SmoothScroll'
import { useLanguage } from './language'

const LINE_COUNT = 5
const LINE_INTERVAL_MS = 260
const PROGRESS_MS = 1700
const FAST_PROGRESS_MS = 400
export const BOOT_STORAGE_KEY = 'sofia-booted'

interface BootScreenProps {
  /** Chamado quando a cortina começa a subir (o Hero pode iniciar suas animações). */
  onDone: () => void
}

/**
 * Tela de boot estilo CRT. Cores fixas de propósito: um terminal de inicialização
 * é sempre escuro, independente do tema do site.
 * Fluxo: linhas em cascata → barra de 0 a 100% → cortina sobe (clip-path).
 * Na mesma sessão (sessionStorage) roda em modo rápido (400ms).
 */
export function BootScreen({ onDone }: BootScreenProps) {
  const reducedMotion = usePrefersReducedMotion()
  const { stop, start } = useSmoothScroll()
  const { tx } = useLanguage()
  const BOOT_LINES = tx(ui.boot.lines)
  const [visible, setVisible] = useState(true)
  const [lineCount, setLineCount] = useState(0)
  const [pct, setPct] = useState(0)
  const [fast, setFast] = useState(false)
  const finishedRef = useRef(false)

  // Encerra uma única vez (fim natural ou clique para pular)
  const finish = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    try {
      sessionStorage.setItem(BOOT_STORAGE_KEY, '1')
    } catch {
      // sessionStorage bloqueado: o boot só roda completo de novo no próximo load
    }
    setVisible(false)
    onDone()
  }

  useEffect(() => {
    stop()
    let seen = false
    try {
      seen = sessionStorage.getItem(BOOT_STORAGE_KEY) === '1'
    } catch {
      seen = false
    }
    const quick = seen || reducedMotion
    setFast(quick)

    const timers: Array<ReturnType<typeof setTimeout>> = []
    let frame = 0

    const runProgress = () => {
      const duration = quick ? FAST_PROGRESS_MS : PROGRESS_MS
      const startedAt = performance.now()
      const tick = (now: number) => {
        const value = Math.min(100, Math.floor(((now - startedAt) / duration) * 100))
        setPct(value)
        if (value < 100) {
          frame = requestAnimationFrame(tick)
        } else {
          timers.push(setTimeout(finish, 260))
        }
      }
      frame = requestAnimationFrame(tick)
    }

    if (quick) {
      setLineCount(LINE_COUNT)
      runProgress()
    } else {
      for (let i = 0; i < LINE_COUNT; i += 1) {
        timers.push(setTimeout(() => setLineCount(i + 1), (i + 1) * LINE_INTERVAL_MS))
      }
      timers.push(setTimeout(runProgress, (LINE_COUNT + 1) * LINE_INTERVAL_MS))
    }

    return () => {
      timers.forEach(clearTimeout)
      cancelAnimationFrame(frame)
      start()
    }
    // `finish` é estável o bastante (usa refs/setters); rodar uma vez por mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, stop, start])

  const complete = pct >= 100

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          role="status"
          aria-live="polite"
          aria-label={tx(ui.boot.label)}
          onClick={finish}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: reducedMotion ? 0 : 0.9, ease: [0.76, 0, 0.24, 1] }}
          style={{ clipPath: 'inset(0 0 0 0)' }}
          className="fixed inset-0 z-[90] flex cursor-pointer items-end bg-[#121110] p-6 font-mono text-xs text-[#c4b27a] md:p-12 md:text-sm"
        >
          {/* Scanlines do CRT */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(to bottom, rgba(245, 238, 220, 0.04) 0px, transparent 2px, transparent 4px)',
            }}
          />

          <div className="relative w-full max-w-xl">
            <ol className="space-y-1.5">
              {BOOT_LINES.slice(0, lineCount).map((line, i) => (
                <motion.li
                  key={line}
                  initial={fast || reducedMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={i === LINE_COUNT - 1 ? 'text-[#e05a47]' : undefined}
                >
                  {line}
                </motion.li>
              ))}
            </ol>

            <div className="mt-8">
              <div className="flex items-center justify-between text-[10px] tracking-[0.3em] uppercase">
                <span>{complete ? tx(ui.boot.complete) : tx(ui.boot.transferring)}</span>
                <span className="tabular-nums">{String(pct).padStart(3, '0')}%</span>
              </div>
              <div className="mt-2 h-px w-full bg-[#c4b27a]/20">
                <div className="h-px bg-[#e05a47]" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-3 text-[10px] text-[#c4b27a]/50">{tx(ui.boot.skip)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
