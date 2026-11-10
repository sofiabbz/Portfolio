import { motion, useScroll, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { Moon, Sun, Command } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useSmoothScroll } from './SmoothScroll'
import { useLanguage } from './language'
import { Button } from '@/components/ui/Button'
import { TOP_BAR_HEIGHT, TOP_BAR_OFFSET } from '@/content/navigation'
import { ui } from '@/content/ui'

const CLOCK_PLACEHOLDER = '--:--:--'

function useBrasiliaClock(): string {
  // Placeholder estável no SSR; o relógio real só começa depois do mount.
  const [time, setTime] = useState(CLOCK_PLACEHOLDER)

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    const tick = () => setTime(formatter.format(new Date()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return time
}

/**
 * Faixa fixa do topo: status "online" (clicável → topo) à esquerda, relógio de
 * Brasília à direita e uma linha de progresso de scroll logo abaixo. Sem navegação.
 */
export function TopBar() {
  const time = useBrasiliaClock()
  const { scrollTo } = useSmoothScroll()
  const { tx } = useLanguage()
  // scrollYProgress vai de 0 (topo) a 1 (rodapé); a mola suaviza os saltos do Lenis.
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-sand font-mono text-[11px] text-bar-fg">
      <div className="flex items-center justify-between px-4 md:px-6" style={{ height: TOP_BAR_HEIGHT }}>
        <button
          type="button"
          onClick={() => scrollTo(0)}
          className="flex items-center gap-2 tracking-wider transition-opacity hover:opacity-70"
          aria-label={tx(ui.topbar.backToTop)}
        >
          <span aria-hidden="true" className="inline-block size-2 animate-pulse rounded-full bg-bar-fg" />
          <span>{tx(ui.topbar.online)}</span>
        </button>
        <span className="tracking-wider">
          brasília-2026 ·{' '}
          <time aria-label={tx(ui.topbar.clock)} className="tabular-nums">
            {time}
          </time>
        </span>
      </div>
      <motion.div aria-hidden="true" className="h-[2px] w-full origin-left bg-bar-fg" style={{ scaleX }} />
    </header>
  )
}

interface TopActionsProps {
  onOpenPalette: () => void
}

/** Botões ⌘K, idioma e tema, logo abaixo da faixa fixa, à direita. */
export function TopActions({ onOpenPalette }: TopActionsProps) {
  const { theme, toggleTheme } = useTheme()
  const { lang, toggleLang, tx } = useLanguage()
  const isDark = theme === 'dark'
  const themeLabel = isDark ? tx(ui.topbar.themeToLight) : tx(ui.topbar.themeToDark)
  const buttonClass = 'bg-ink/80 text-sand-deep backdrop-blur-sm hover:text-cream'

  return (
    <div className="fixed right-4 z-50 flex items-center gap-2 md:right-6" style={{ top: TOP_BAR_OFFSET + 12 }}>
      <Button size="sm" variant="outline" onClick={onOpenPalette} className={buttonClass} aria-keyshortcuts="Control+K Meta+K" data-cursor="⌘K">
        <Command className="size-3.5" aria-hidden="true" />
        <span>
          <kbd className="font-mono">⌘K</kbd> {tx(ui.topbar.commands)}
        </span>
      </Button>
      {/* Mostra o idioma PARA O QUAL o clique leva (EN quando o site está em PT) */}
      <Button
        size="sm"
        variant="outline"
        onClick={toggleLang}
        aria-label={tx(ui.topbar.switchLang)}
        title={tx(ui.topbar.switchLangShort)}
        data-cursor={lang === 'pt' ? 'english' : 'português'}
        className={`${buttonClass} w-10 px-0 tracking-wider`}
      >
        <span lang={lang === 'pt' ? 'en' : 'pt-BR'}>{lang === 'pt' ? 'EN' : 'PT'}</span>
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={toggleTheme}
        aria-label={themeLabel}
        aria-pressed={!isDark}
        title={themeLabel}
        data-cursor={isDark ? 'light' : 'dark'}
        className={buttonClass}
      >
        {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
      </Button>
    </div>
  )
}
