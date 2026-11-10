import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { about } from '@/content/portfolio'
import { sections } from '@/content/navigation'
import { usePrefersReducedMotion } from '@/lib/hooks'
import { ClipReveal } from './ClipReveal'
import { ContactForm } from './ContactForm'
import { SectionHeading } from './SectionHeading'
import { useLanguage } from './language'

interface WordProps {
  word: string
  index: number
  total: number
  progress: MotionValue<number>
  reducedMotion: boolean
}

/** Cada palavra ganha opacidade conforme o scroll avança pelo parágrafo. */
function Word({ word, index, total, progress, reducedMotion }: WordProps) {
  const start = index / total
  const end = Math.min(1, start + 1 / total + 0.08)
  const opacity = useTransform(progress, [start, end], [0.28, 1])
  return (
    <motion.span style={{ opacity: reducedMotion ? 1 : opacity }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  )
}

export function About() {
  const reducedMotion = usePrefersReducedMotion()
  const { tx, lang } = useLanguage()
  const paragraphRef = useRef<HTMLParagraphElement | null>(null)
  const { scrollYProgress } = useScroll({ target: paragraphRef, offset: ['start 0.85', 'end 0.45'] })
  const words = tx(about.text).split(' ')
  const section = sections[1]

  return (
    <section id="sobre" aria-labelledby="sobre-title" className="scroll-mt-[38px]">
      <ClipReveal direction="left">
        <div className="bg-rust text-on-rust">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 md:px-12 md:py-24">
            <SectionHeading index="01" title={section ? tx(section.label) : 'Sobre'} id="sobre-title" tone="on-rust" />

            {/* key={lang}: ao trocar o idioma o parágrafo remonta e o efeito de opacidade recomeça limpo */}
            <p key={lang} ref={paragraphRef} className="max-w-3xl font-body text-xl leading-relaxed md:text-2xl md:leading-relaxed">
              {words.map((word, i) => (
                <Word key={i} word={word} index={i} total={words.length} progress={scrollYProgress} reducedMotion={reducedMotion} />
              ))}
            </p>

            <div className="mt-16 border-t border-on-rust/25 pt-12 md:mt-20">
              <h3 className="font-display text-2xl font-extrabold tracking-wide uppercase md:text-3xl">{tx(about.formTitle)}</h3>
              <p className="mt-2 max-w-xl text-on-rust/80">{tx(about.formIntro)}</p>
              <ContactForm className="mt-8" />
            </div>
          </div>
        </div>
      </ClipReveal>
    </section>
  )
}
