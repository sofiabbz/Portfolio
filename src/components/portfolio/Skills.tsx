import { motion } from 'motion/react'
import { useRef } from 'react'
import { skills } from '@/content/portfolio'
import { sections } from '@/content/navigation'
import { usePrefersReducedMotion } from '@/lib/hooks'
import { ScrambleText } from './ScrambleText'
import { SectionHeading } from './SectionHeading'
import { useLanguage } from './language'

export function Skills() {
  const reducedMotion = usePrefersReducedMotion()
  const { tx } = useLanguage()
  const bandRef = useRef<HTMLDivElement | null>(null)
  const section = sections[4]

  // Spotlight: grava a posição do mouse em variáveis CSS; o gradiente usa --mx/--my.
  // Escrever no style direto evita re-render a cada movimento.
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const band = bandRef.current
    if (!band) return
    const rect = band.getBoundingClientRect()
    band.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    band.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <section id="skills" aria-labelledby="skills-title" className="scroll-mt-[38px]">
      <div
        ref={bandRef}
        onPointerMove={onPointerMove}
        className="relative bg-sand text-on-sand"
        style={{ ['--mx' as string]: '-500px', ['--my' as string]: '-500px' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background: 'radial-gradient(260px circle at var(--mx) var(--my), color-mix(in oklch, var(--cream) 35%, transparent), transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-8 md:px-12 md:py-24">
          <SectionHeading index="04" title={section ? tx(section.label) : 'Skills'} id="skills-title" tone="on-sand" />

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((group, i) => (
              <motion.li
                key={group.id}
                initial={reducedMotion ? false : { opacity: 0, x: i % 2 === 0 ? -28 : 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-sm border border-ink/30 bg-ink p-5 text-cream"
              >
                <ScrambleText as="h3" text={tx(group.title)} className="font-display text-lg font-extrabold tracking-wide uppercase" />
                <ul className="mt-3 space-y-1 font-mono text-sm text-cream/85">
                  {tx(group.items).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden="true" className="text-sand">
                        ›
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                {group.note && <p className="mt-3 font-mono text-xs text-dim">{tx(group.note)}</p>}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
