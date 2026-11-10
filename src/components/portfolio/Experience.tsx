import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'
import { experience } from '@/content/portfolio'
import { sections } from '@/content/navigation'
import { ui } from '@/content/ui'
import { usePrefersReducedMotion } from '@/lib/hooks'
import { SectionHeading } from './SectionHeading'
import { useLanguage } from './language'
import { cn } from '@/lib/utils'

export function Experience() {
  const reducedMotion = usePrefersReducedMotion()
  const { tx } = useLanguage()
  const listRef = useRef<HTMLOListElement | null>(null)
  // Trilho se preenche de verde conforme a lista cruza a viewport
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.8', 'end 0.6'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 24 })
  const scaleY = useTransform(smooth, [0, 1], [0, 1])
  const section = sections[2]

  return (
    <section id="experiencia" aria-labelledby="experiencia-title" className="scroll-mt-[38px]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 md:px-12 md:py-24">
        <SectionHeading index="02" title={section ? tx(section.label) : 'Experiência'} id="experiencia-title" command={tx(ui.experience.command)} />

        <ol ref={listRef} className="relative ml-2 space-y-10 border-l hairline pl-8 md:ml-4 md:pl-12">
          {/* Preenchimento do trilho */}
          <motion.span
            aria-hidden="true"
            className="absolute top-0 -left-px h-full w-px origin-top bg-signal"
            style={{ scaleY: reducedMotion ? 1 : scaleY }}
          />

          {experience.map((entry, index) => (
            <motion.li
              key={entry.id}
              initial={reducedMotion ? false : { opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Nó na linha */}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-2 -left-8 flex size-3 -translate-x-1/2 items-center justify-center rounded-full border-2 md:-left-12',
                  entry.current ? 'pulse-dot border-signal bg-signal' : 'border-dim bg-ink',
                )}
              />

              <article className="rounded-sm border hairline bg-panel p-5 md:p-6">
                <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xs">
                  <span className="text-sand-deep" aria-hidden="true">
                    {entry.hash}
                  </span>
                  <span className="text-dim">{tx(entry.period)}</span>
                  {entry.current && (
                    <span className="rounded-xs bg-signal-bg px-1.5 py-0.5 text-[10px] tracking-widest text-signal uppercase">
                      {tx(ui.experience.current)}
                    </span>
                  )}
                </header>
                <h3 className="font-display mt-2 text-xl font-extrabold tracking-wide uppercase md:text-2xl">{tx(entry.title)}</h3>
                <p className="mt-1 text-sm text-cream/75">{tx(entry.org)}</p>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-cream/90">
                  {tx(entry.bullets).map((bullet, i) => (
                    <motion.li
                      key={i}
                      initial={reducedMotion ? false : { opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.25 + i * 0.12 }}
                      className="flex gap-3"
                    >
                      <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-sand" />
                      <span>{bullet}</span>
                    </motion.li>
                  ))}
                </ul>
              </article>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
