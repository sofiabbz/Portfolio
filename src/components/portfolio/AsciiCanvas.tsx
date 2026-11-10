import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/lib/hooks'
import { useTheme } from './ThemeProvider'

// Rampa de densidade (do mais vazio ao mais denso) e glifos de "glitch".
const RAMP = ' .,:-=+*#%@'
const GLITCH = '01<>/\\{}[]#$%&*+=?!'
const FONT_PX = 10
const CELL_W = 6 // largura média de um glifo JetBrains Mono a 10px
const CELL_H = 11
const MOUSE_RADIUS = 140
const POINTS = 5
const SEG = (Math.PI * 2) / POINTS

interface Palette {
  sand: string
  ember: string
}

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement)
  return {
    sand: style.getPropertyValue('--sand').trim() || '#c4b27a',
    ember: style.getPropertyValue('--ember').trim() || '#e05a47',
  }
}

/**
 * Sampler polar: devolve o brilho (0..1) de um ponto normalizado (nx, ny ∈ [-1, 1]).
 * - Estrela de 5 pontas: raio da borda interpola do vale (0.42) até a ponta (0.95).
 * - Interior preenchido por uma espiral logarítmica animada no tempo.
 * - Contorno externo destacado.
 */
export function sampleStar(nx: number, ny: number, t: number, mouseX: number): number {
  const r = Math.hypot(nx, ny)
  if (r > 1) return 0
  const theta = Math.atan2(ny, nx)
  const rot = t * 0.12 + mouseX * 0.25

  // Posição dentro do segmento: 0 no centro da ponta, 1 no vale
  const local = (((theta - rot) % SEG) + SEG) % SEG
  const k = 1 - Math.abs(local / SEG - 0.5) * 2 // 1 = ponta, 0 = vale
  const edge = 0.42 + (0.95 - 0.42) * Math.pow(k, 1.6)
  if (r > edge) return 0
  if (r > edge - 0.05) return 0.9 // contorno

  const spiral = Math.sin(theta * 2 - Math.log(r + 0.02) * 5 + t * 1.4)
  return spiral > 0.1 ? 0.7 : 0.28
}

interface AsciiStarProps {
  className?: string
}

/**
 * Estrela ASCII interativa em canvas (JetBrains Mono 10px).
 * - DPR limitado a 2, ResizeObserver, pausa fora da viewport/aba oculta.
 * - pointermove capturado na janela: a camada visual tem pointer-events:none.
 * - Mouse (raio 140px) empurra glifos com força ∝ 1/d²; glifos afetados têm 50%
 *   de chance por frame de virar glitch e ficam coral.
 * - Em reduced-motion desenha um frame estático (sem rotação/espiral animada).
 */
export function AsciiStar({ className }: AsciiStarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let palette = readPalette()
    let width = 0
    let height = 0
    let frame = 0
    let running = true
    let visible = true
    const pointer = { x: -9999, y: -9999, nx: 0 }
    // Glifo de glitch atual por célula (persistente até ser re-sorteado)
    let glitchMap: Uint8Array = new Uint8Array(0)
    let cols = 0
    let rows = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(width / CELL_W)
      rows = Math.ceil(height / CELL_H)
      glitchMap = new Uint8Array(cols * rows)
      draw(performance.now())
    }

    const draw = (now: number) => {
      const t = reducedMotion ? 0 : now / 1000
      ctx.clearRect(0, 0, width, height)
      ctx.font = `500 ${FONT_PX}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const aspect = width / height
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          let x = col * CELL_W + CELL_W / 2
          let y = row * CELL_H + CELL_H / 2
          // Normaliza para [-1, 1] respeitando o aspect ratio (círculo não vira elipse)
          let nx = (x / width) * 2 - 1
          let ny = (y / height) * 2 - 1
          if (aspect > 1) nx *= aspect
          else ny /= aspect

          const brightness = sampleStar(nx, ny, t, pointer.nx)
          if (brightness <= 0) continue

          let char = RAMP.charAt(Math.min(RAMP.length - 1, Math.floor(brightness * RAMP.length)))
          let color = palette.sand
          let alpha = 0.35 + brightness * 0.65

          const dx = x - pointer.x
          const dy = y - pointer.y
          const d = Math.hypot(dx, dy)
          if (d < MOUSE_RADIUS) {
            // Força inversamente proporcional ao quadrado da distância (limitada perto do centro)
            const safe = Math.max(d, 18)
            const force = Math.min(28, (MOUSE_RADIUS * MOUSE_RADIUS * 0.12) / (safe * safe))
            x += (dx / safe) * force
            y += (dy / safe) * force
            const idx = row * cols + col
            if (!reducedMotion && Math.random() < 0.5) {
              glitchMap[idx] = 1 + Math.floor(Math.random() * GLITCH.length)
            }
            const g = glitchMap[idx] ?? 0
            if (g > 0) char = GLITCH.charAt(g - 1)
            color = palette.ember
            alpha = 0.85
          } else {
            const idx = row * cols + col
            if ((glitchMap[idx] ?? 0) > 0) glitchMap[idx] = 0
          }

          if (char === ' ') continue
          ctx.globalAlpha = alpha
          ctx.fillStyle = color
          ctx.fillText(char, x, y)
        }
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      if (!running) return
      if (visible && !document.hidden) draw(now)
      frame = requestAnimationFrame(loop)
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      // mouseX normalizado em [-1, 1] pela largura da janela (gira a estrela levemente)
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1
      if (reducedMotion) draw(performance.now())
    }
    const onPointerLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting)
    })
    io.observe(canvas)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onPointerLeave)

    palette = readPalette()
    resize()
    if (!reducedMotion) frame = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('mouseleave', onPointerLeave)
    }
    // `theme` nas deps: relê os tokens de cor quando o tema muda
  }, [reducedMotion, theme])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}
