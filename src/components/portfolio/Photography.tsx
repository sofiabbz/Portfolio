import { AnimatePresence, motion, useScroll, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { galleryIsDemo, photography, photos } from '@/content/portfolio'
import { ui } from '@/content/ui'
import { useLanguage } from './language'
import { usePrefersReducedMotion } from '@/lib/hooks'
import { createCameraSampler } from '@/lib/camera-art'
import { SectionHeading } from './SectionHeading'
import { useTheme } from './ThemeProvider'

const RAMP = ' .,:-=+*#%@'
const GLITCH = '01<>/\\{}[]#$%&*+=?!'
const CAMERA_CODE =
  'sensor_init();CMD_SHUTTER=1;AF_MATRIX_CALCULATION;{JSON_PAYLOAD:iso:400,f:2.8};CAFE_BUFFER_OVERFLOW;exposure+=0.3;raw.write(frame);flash.ready();focus.lock();while(light){capture();}'
const LINE_THRESHOLD = 0.55
const SHUTTER_OPEN_GALLERY_MS = 320
const SHUTTER_TOTAL_MS = 600

interface Palette {
  cream: string
  dim: string
  ember: string
}

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement)
  return {
    cream: style.getPropertyValue('--cream').trim() || '#f5eedc',
    dim: style.getPropertyValue('--dim').trim() || '#7a7465',
    ember: style.getPropertyValue('--ember').trim() || '#e05a47',
  }
}

interface AsciiCameraCanvasProps {
  /** 0 = caracteres dispersos, 1 = câmera montada. Lido a cada frame (sem re-render). */
  progress: MotionValue<number>
  fontSize?: number
  radius?: number
  className?: string
}

/**
 * Motor ASCII em canvas: lê a silhueta pelo sampler célula a célula; onde há
 * traço (brilho > 0.55) imprime o "código de hardware" em loop contínuo, no
 * restante usa a rampa de densidade. Cada célula tem um vetor de dispersão
 * aleatório (120–520px) e um atraso próprio (stagger) para a montagem por scroll.
 * Mouse num raio de 130px empurra elasticamente, troca por glitch e pinta coral.
 */
function AsciiCameraCanvas({ progress, fontSize = 10, radius = 130, className }: AsciiCameraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // O sampler cria um canvas offscreen: só aqui, nunca no render (SSR).
    const sampler = createCameraSampler()
    const palette = readPalette()

    let w = 0
    let h = 0
    let cols = 0
    let rows = 0
    let cw = 0
    let ch = 0
    let scatter = new Float32Array(0)
    const mouse = { x: -9999, y: -9999 }
    let visible = true
    let running = true
    let frame = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cw = fontSize * 0.62
      ch = fontSize * 1.12
      cols = Math.ceil(w / cw)
      rows = Math.ceil(h / ch)
      // Por célula: deslocamento x, deslocamento y, atraso (0..1)
      scatter = new Float32Array(cols * rows * 3)
      for (let i = 0; i < scatter.length; i += 3) {
        const a = Math.random() * Math.PI * 2
        const d = 120 + Math.random() * 400
        scatter[i] = Math.cos(a) * d
        scatter[i + 1] = Math.sin(a) * d
        scatter[i + 2] = Math.random()
      }
      draw(performance.now())
    }

    const draw = (time: number) => {
      if (!w || !h) return
      const t = reducedMotion ? 0 : time / 1000
      ctx.clearRect(0, 0, w, h)
      ctx.font = `500 ${fontSize}px "JetBrains Mono", monospace`
      ctx.textBaseline = 'top'
      const s = Math.min(w, h) / 2
      const aspect = w / h
      const sctx = { aspect, wobble: !reducedMotion }
      const textOffset = Math.floor(t * 6) // o código "corre" pelo contorno
      const tl = CAMERA_CODE.length
      const p = reducedMotion ? 1 : progress.get()
      const ease = 1 - Math.pow(1 - p, 3)

      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const px = c * cw
          const py = r * ch
          const x = (px + cw / 2 - w / 2) / s
          const y = (py + ch / 2 - h / 2) / s
          const v = sampler(x, y, t, sctx)
          if (v < 0.06) continue

          const i = (r * cols + c) * 3
          // Cada célula "chega" num momento diferente conforme o progresso
          const stagger = Math.min(1, Math.max(0, ease * 1.6 - (scatter[i + 2] ?? 0) * 0.6))
          if (stagger <= 0.01) continue

          const isLine = v > LINE_THRESHOLD
          let glyph = isLine
            ? (CAMERA_CODE[(r * cols + c + textOffset) % tl] ?? ' ')
            : (RAMP[Math.min(RAMP.length - 1, Math.floor(v * (RAMP.length - 1)) + 1)] ?? '@')
          let fill = isLine ? palette.cream : palette.dim
          let ox = 0
          let oy = 0

          const dx = px - mouse.x
          const dy = py - mouse.y
          const dist = Math.hypot(dx, dy)
          const inf = Math.max(0, 1 - dist / radius)
          if (inf > 0) {
            const push = inf * inf * 18
            ox = (dx / (dist || 1)) * push
            oy = (dy / (dist || 1)) * push
            if (!reducedMotion && Math.random() < inf * 0.5) glyph = GLITCH[(Math.random() * GLITCH.length) | 0] ?? '#'
            if (inf > 0.35) fill = palette.ember
          }

          const fly = 1 - stagger
          ox += (scatter[i] ?? 0) * fly
          oy += (scatter[i + 1] ?? 0) * fly

          ctx.fillStyle = fill
          ctx.globalAlpha = stagger * (isLine ? 1 : 0.4 + v * 0.6)
          ctx.fillText(glyph, px + ox, py + oy)
        }
      }
      ctx.globalAlpha = 1
    }

    const loop = (time: number) => {
      if (!running) return
      if (visible && !document.hidden) draw(time)
      frame = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      if (reducedMotion) draw(performance.now())
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting)
    })
    io.observe(canvas)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)

    resize()
    if (!reducedMotion) frame = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [fontSize, radius, progress, reducedMotion, theme])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}

interface PhotographyProps {
  onOpenGallery: () => void
}

export function Photography({ onOpenGallery }: PhotographyProps) {
  const reducedMotion = usePrefersReducedMotion()
  const { tx } = useLanguage()
  const ph = ui.photography
  const sectionRef = useRef<HTMLElement | null>(null)
  const [shutter, setShutter] = useState(false)
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([])

  // 0 quando a seção toca o rodapé da viewport, 1 quando seu centro chega ao centro da tela
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'center center'] })

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const triggerShutter = () => {
    if (reducedMotion) {
      onOpenGallery()
      return
    }
    setShutter(true)
    timers.current.push(setTimeout(onOpenGallery, SHUTTER_OPEN_GALLERY_MS))
    timers.current.push(setTimeout(() => setShutter(false), SHUTTER_TOTAL_MS))
  }

  return (
    <section id="fotografia" ref={sectionRef} aria-labelledby="fotografia-title" className="scroll-mt-[38px]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 md:px-12 md:py-24">
        <SectionHeading index="05" title={tx(ph.title)} id="fotografia-title" command={tx(ph.command)} />

        <button
          type="button"
          onClick={triggerShutter}
          aria-label={tx(ph.open)}
          data-cursor={tx(ph.cursor)}
          className="group relative mx-auto block aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-sm"
        >
          <AsciiCameraCanvas progress={scrollYProgress} className="h-full w-full" />

          <span className="pointer-events-none absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-1/2 border border-sand/30 bg-ink/85 px-5 py-3 text-center font-mono transition-transform duration-300 group-hover:scale-105">
            <span className="block text-sm font-bold text-ember">
              <span aria-hidden="true" className="mr-1.5 inline-block size-2 animate-pulse rounded-full bg-ember align-middle" />
              {tx(ph.explore)}
            </span>
            <span className="mt-1 block text-xs tracking-widest text-sand uppercase">{tx(ph.gallery)}</span>
          </span>
        </button>

        <div className="mx-auto mt-8 max-w-4xl">
          <p className="max-w-xl text-lg leading-relaxed text-cream/90">
            {tx(photography.intro)} {tx(photography.count).replace('{n}', String(photos.length))}
          </p>
          {galleryIsDemo && (
            <p className="mt-4 max-w-xl rounded-xs border border-ember/50 px-3 py-2 font-mono text-xs text-ember">{tx(ph.demoNotice)}</p>
          )}
        </div>
      </div>

      {/* Obturador em tela cheia: cortinas fecham até o centro (~350ms), flash, cortinas abrem */}
      <AnimatePresence>
        {shutter && (
          <motion.div
            key="shutter"
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[99]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="absolute inset-x-0 top-0 h-1/2 bg-[#121110]"
              initial={{ y: '-100%' }}
              animate={{ y: ['-100%', '0%', '0%', '-100%'] }}
              transition={{ duration: 0.55, times: [0, 0.35, 0.55, 1], ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-1/2 bg-[#121110]"
              initial={{ y: '100%' }}
              animate={{ y: ['100%', '0%', '0%', '100%'] }}
              transition={{ duration: 0.55, times: [0, 0.35, 0.55, 1], ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-0 bg-[#f5eedc]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.9, 0] }}
              transition={{ duration: 0.55, times: [0, 0.5, 0.6, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
