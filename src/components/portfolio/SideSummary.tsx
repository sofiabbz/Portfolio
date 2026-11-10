import { useEffect, useState } from 'react'
import { sections, TOP_BAR_OFFSET, type SectionId } from '@/content/navigation'
import { ui } from '@/content/ui'
import { useSmoothScroll } from './SmoothScroll'
import { useLanguage } from './language'
import { cn } from '@/lib/utils'

/**
 * Descobre a seção corrente pelo scroll: a última seção cujo topo já passou
 * da linha de leitura (um pouco abaixo da barra fixa). Throttle via rAF.
 */
function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>('inicio')

  useEffect(() => {
    let frame = 0
    const compute = () => {
      frame = 0
      const line = TOP_BAR_OFFSET + window.innerHeight * 0.35
      let current: SectionId = sections[0]?.id ?? 'inicio'
      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= line) current = section.id
      }
      // Ao chegar no fim da página, marca a última (ela pode ser baixa demais para cruzar a linha)
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = sections[sections.length - 1]?.id ?? current
      }
      setActive(current)
    }
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return active
}

/** Sumário fixo na lateral direita. A partir de lg: número + nome com trilho; abaixo: só números. */
export function SideSummary() {
  const active = useActiveSection()
  const { scrollTo } = useSmoothScroll()
  const { tx } = useLanguage()

  return (
    <nav aria-label={tx(ui.summary.label)} className="fixed top-1/2 right-2 z-40 -translate-y-1/2 lg:right-6">
      <ol className="relative flex flex-col gap-3 lg:gap-2 lg:border-l lg:pl-4 hairline">
        {sections.map((section) => {
          const isActive = section.id === active
          const label = tx(section.label)
          return (
            <li key={section.id} className="relative">
              {/* Marcador no trilho (desktop) */}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-1/2 -left-4 hidden h-px w-3 -translate-y-1/2 transition-[width,background-color] duration-300 lg:block',
                  isActive ? 'w-4 bg-sand' : 'bg-dim/50',
                )}
              />
              <a
                href={`#${section.id}`}
                aria-label={`${section.index} ${label}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  scrollTo(section.id)
                }}
                className={cn(
                  'group flex items-center gap-2 font-mono text-[11px] tracking-widest transition-colors duration-200',
                  isActive ? 'text-sand' : 'text-dim hover:text-cream',
                )}
              >
                <span className="tabular-nums">{section.index}</span>
                <span className="hidden lg:inline">{label.toLowerCase()}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
